import * as chrono from 'chrono-node';

// "<subject> (is) expected to / set to / will / to <predicate>"
const TRIGGER =
  /^(.{3,120}?)\s+(?:(?:is|are)\s+)?(?:expected to|set to|due to|scheduled to|poised to|will|to)\s+(.{4,160})$/i;

const CATEGORY_KEYWORDS = [
  ['Sports', /\b(match|cup|final|league|tournament|championship|season)\b/i],
  ['Economy', /\b(rates?|inflation|gdp|jobs|unemployment|fed|central bank|earnings)\b/i],
  ['Politics', /\b(election|vote|parliament|senate|council|bill|minister)\b/i],
  ['Technology', /\b(launch|release|phone|ai|software|chip)\b/i],
];

export function fmtDate(d) {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function pickCategory(text, fallback) {
  for (const [name, re] of CATEGORY_KEYWORDS) if (re.test(text)) return name;
  return fallback || 'General';
}

// Returns a candidate draft, or null if the article doesn't describe a future,
// market-shaped event.
export function extractCandidate(article, source, now = new Date()) {
  const title = article.title.replace(/\s+/g, ' ').trim();
  const m = title.match(TRIGGER);
  if (!m) return null;

  const subject = m[1].trim();
  let predicate = m[2].trim();

  const text = `${title}. ${article.summary || ''}`;
  const hit = chrono
    .parse(text, now, { forwardDate: true })
    .find((r) => r.start.isCertain('day') && r.start.date() > now);

  let eventDate = null;
  if (hit) {
    eventDate = hit.start.date();
    predicate = predicate.replace(hit.text, '');
  }
  predicate = predicate
    .replace(/\s{2,}/g, ' ')
    .replace(/[\s,;:-]+$/, '')
    .replace(/\s+(on|by|in|at|before)$/i, '')
    .trim();
  if (!predicate) return null;

  const dateLabel = eventDate ? fmtDate(eventDate) : null;
  const question = `Will ${subject} ${predicate}${dateLabel ? ` by ${dateLabel}` : ''}?`;
  const resolutionSource = source?.resolutionSource || null;

  return {
    question,
    category: pickCategory(title, source?.category),
    description: (article.summary || title).slice(0, 400),
    outcomes: ['Yes', 'No'],
    eventDate,
    closeDate: eventDate,
    resolutionCriteria:
      `This market resolves "Yes" if ${
        resolutionSource
          ? `the official source at ${resolutionSource}`
          : 'a reliable official source (to be specified by the reviewer)'
      } confirms that ${subject} ${predicate} on or before ${dateLabel || 'the closing date'}; otherwise it resolves "No".`,
    resolutionSource,
    sources: [
      {
        title: article.title,
        url: article.link,
        publisher: article.publisher,
        publishedAt: article.publishedAt,
        snippet: (article.summary || '').slice(0, 300),
        mentionedDate: eventDate,
      },
    ],
  };
}