import { config } from '../config.js';
import { SOURCES } from '../config/sources.js';
import { Candidate } from '../models/Candidate.js';
import { DiscoveryRun } from '../models/DiscoveryRun.js';
import { fetchFeed } from './rss.js';
import { extractCandidate } from './extractor.js';
import { validateCandidate } from './validator.js';
import { findSimilar } from './dedupe.js';
import { sampleArticles } from '../seed/sampleArticles.js';
import { logger } from '../utils/logger.js';

const MERGE_THRESHOLD = 0.8;
const FLAG_THRESHOLD = 0.6;

let running = false;
export const isRunning = () => running;

async function processArticle(article, source) {
  const draft = extractCandidate(article, source);
  if (!draft) return 'skipped';

  // 1. Same source URL seen before: repeated discovery.
  const byUrl = await Candidate.findOne({ 'sources.url': article.link });
  if (byUrl) {
    byUrl.discoveryCount += 1;
    await byUrl.save();
    return 'repeats';
  }

  // 2. Similar question already exists.
  const existing = await Candidate.find().select('question status').lean();
  const sim = findSimilar(draft.question, existing, FLAG_THRESHOLD);

  if (sim && sim.score >= MERGE_THRESHOLD) {
    const target = await Candidate.findById(sim.doc._id);
    target.discoveryCount += 1;
    if (target.status === 'pending_review') {
      // Corroborating source: attach it and re-validate (may surface conflicting dates).
      target.sources.push(draft.sources[0]);
      target.validation = validateCandidate(target.toObject(), { duplicateOf: target.duplicateOf });
      target.history.push({ action: 'source_added', by: 'discovery', note: article.link });
    }
    await target.save();
    return 'merged';
  }

  const duplicateOf = sim ? sim.doc._id : undefined;
  const candidate = new Candidate({
    ...draft,
    duplicateOf,
    status: 'pending_review', // never auto-published
    history: [{ action: 'discovered', by: 'discovery', note: article.link }],
  });
  candidate.validation = validateCandidate(candidate.toObject(), { duplicateOf });
  await candidate.save();
  return 'created';
}

export async function runDiscovery() {
  running = true;
  const run = await DiscoveryRun.create({ startedAt: new Date() });
  const stats = { articles: 0, skipped: 0, created: 0, merged: 0, repeats: 0, errors: 0 };
  const errors = [];

  try {
    let items = [];
    if (!config.useSampleData) {
      for (const source of SOURCES) {
        try {
          const articles = await fetchFeed(source);
          items.push(...articles.map((article) => ({ article, source })));
          logger.info('feed fetched', { source: source.id, count: articles.length });
        } catch (err) {
          errors.push({ source: source.id, message: err.message });
          logger.warn('feed failed', { source: source.id, error: err.message });
        }
      }
    }

    if (items.length === 0) {
      run.usedFallback = true;
      items = sampleArticles().map((article) => ({
        article,
        source: SOURCES.find((s) => s.id === article.sourceId) || SOURCES[0],
      }));
    }

    stats.articles = items.length;
    for (const { article, source } of items) {
      try {
        const outcome = await processArticle(article, source);
        stats[outcome] += 1;
      } catch (err) {
        stats.errors += 1;
        errors.push({ source: source.id, message: `${article.link}: ${err.message}` });
        logger.error('article processing failed', { link: article.link, error: err.message });
      }
    }
  } finally {
    run.finishedAt = new Date();
    run.stats = stats;
    run.errors = errors;
    await run.save();
    running = false;
  }
  return run;
}