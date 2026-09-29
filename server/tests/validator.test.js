import { describe, it, expect } from 'vitest';
import { validateCandidate } from '../src/services/validator.js';

const now = new Date('2026-09-29T00:00:00Z');
const future = new Date('2026-10-08T12:00:00Z');

const good = () => ({
  question: 'Will Fed cut interest rates by October 8, 2026?',
  outcomes: ['Yes', 'No'],
  eventDate: future,
  closeDate: future,
  resolutionSource: 'https://www.federalreserve.gov/newsevents/pressreleases.htm',
  resolutionCriteria: 'Resolves Yes if the Fed announces a cut on or before the date; otherwise No.',
  sources: [{ url: 'https://a.test', mentionedDate: future }],
});

const codes = (r) => r.issues.map((i) => i.code);

describe('validateCandidate', () => {
  it('does not block a well-formed candidate', () => {
    const r = validateCandidate(good(), {}, now);
    expect(r.blocking).toBe(false);
    expect(r.score).toBeGreaterThan(90);
  });

  it('blocks when there is no resolution source', () => {
    const r = validateCandidate({ ...good(), resolutionSource: null }, {}, now);
    expect(codes(r)).toContain('NO_RESOLUTION_SOURCE');
    expect(r.blocking).toBe(true);
  });

  it('blocks subjective wording', () => {
    const r = validateCandidate({ ...good(), question: 'Will Acme release its best phone by October 8, 2026?' }, {}, now);
    expect(codes(r)).toContain('SUBJECTIVE_OUTCOME');
  });

  it('blocks missing or past dates and close-after-event', () => {
    expect(codes(validateCandidate({ ...good(), eventDate: null }, {}, now))).toContain('NO_EVENT_DATE');
    expect(codes(validateCandidate({ ...good(), eventDate: new Date('2026-01-01') }, {}, now))).toContain('EVENT_IN_PAST');
    const later = new Date('2026-11-01');
    expect(codes(validateCandidate({ ...good(), closeDate: later }, {}, now))).toContain('CLOSE_AFTER_EVENT');
  });

  it('warns on conflicting source dates and duplicates', () => {
    const c = good();
    c.sources.push({ url: 'https://b.test', mentionedDate: new Date('2026-10-15T12:00:00Z') });
    const r = validateCandidate(c, { duplicateOf: 'abc123' }, now);
    expect(codes(r)).toContain('CONFLICTING_SOURCES');
    expect(codes(r)).toContain('DUPLICATE_CANDIDATE');
  });

  it('rejects duplicate outcomes and no sources', () => {
    const r = validateCandidate({ ...good(), outcomes: ['Yes', 'yes'], sources: [] }, {}, now);
    expect(codes(r)).toContain('BAD_OUTCOMES');
    expect(codes(r)).toContain('INSUFFICIENT_SOURCES');
  });
});