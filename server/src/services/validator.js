const SUBJECTIVE =
  /\b(best|worst|good|bad|great|successful|impressive|better|worse|popular|significant|major|soon|strong)\b/i;

const PENALTY = { error: 30, warning: 10, info: 3 };

function isUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateCandidate(c, ctx = {}, now = new Date()) {
  const issues = [];
  const add = (code, severity, message) => issues.push({ code, severity, message });

  const q = (c.question || '').trim();
  if (q.length < 20 || !q.endsWith('?') || !/^will\b/i.test(q)) {
    add('AMBIGUOUS_QUESTION', 'warning', 'Question should be a clear "Will ...?" statement of at least 20 characters.');
  }
  if (SUBJECTIVE.test(q)) {
    add('SUBJECTIVE_OUTCOME', 'error', 'Question contains subjective or vague wording that cannot be objectively resolved.');
  }

  const event = c.eventDate ? new Date(c.eventDate) : null;
  const close = c.closeDate ? new Date(c.closeDate) : null;
  if (!event) add('NO_EVENT_DATE', 'error', 'No event date was found or set.');
  else if (event <= now) add('EVENT_IN_PAST', 'error', 'Event date is not in the future.');

  if (!close) add('NO_CLOSE_DATE', 'error', 'No closing date set.');
  else {
    if (close <= now) add('CLOSE_IN_PAST', 'error', 'Closing date is not in the future.');
    if (event && close > event) add('CLOSE_AFTER_EVENT', 'error', 'Market closes after the event date.');
  }

  if (!c.resolutionSource || !isUrl(c.resolutionSource)) {
    add('NO_RESOLUTION_SOURCE', 'error', 'No valid resolution source URL.');
  }
  if ((c.resolutionCriteria || '').trim().length < 30) {
    add('WEAK_RESOLUTION_CRITERIA', 'warning', 'Resolution criteria are missing or too short.');
  }

  const outcomes = (c.outcomes || []).map((o) => o.trim().toLowerCase());
  if (outcomes.length < 2 || new Set(outcomes).size !== outcomes.length || outcomes.some((o) => !o)) {
    add('BAD_OUTCOMES', 'error', 'Need at least two distinct, non-empty outcomes.');
  }

  const sources = c.sources || [];
  if (sources.length === 0) add('INSUFFICIENT_SOURCES', 'error', 'No supporting sources.');
  else if (sources.length === 1) add('SINGLE_SOURCE', 'info', 'Only one supporting source; consider corroborating.');

  const days = new Set(
    sources
      .map((s) => s.mentionedDate)
      .filter(Boolean)
      .map((d) => new Date(d).toISOString().slice(0, 10))
  );
  if (days.size > 1) {
    add('CONFLICTING_SOURCES', 'warning', `Sources mention different event dates: ${[...days].join(', ')}.`);
  }

  if (ctx.duplicateOf) {
    add('DUPLICATE_CANDIDATE', 'warning', `Highly similar to existing candidate ${ctx.duplicateOf}.`);
  }

  const score = Math.max(0, 100 - issues.reduce((sum, i) => sum + PENALTY[i.severity], 0));
  return {
    issues,
    score,
    blocking: issues.some((i) => i.severity === 'error'),
    checkedAt: now,
  };
}