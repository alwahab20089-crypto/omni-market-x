import { describe, it, expect } from 'vitest';
import { extractCandidate } from '../src/services/extractor.js';

const now = new Date('2026-09-29T00:00:00Z');
const source = { category: 'Economy', resolutionSource: 'https://www.federalreserve.gov/newsevents/pressreleases.htm' };

describe('extractCandidate', () => {
  it('builds a dated yes/no question from a forward-looking headline', () => {
    const c = extractCandidate(
      { title: 'Fed set to cut interest rates on October 8, 2026', summary: '', link: 'https://x.test/a' },
      source,
      now
    );
    expect(c.question).toBe('Will Fed cut interest rates by October 8, 2026?');
    expect(c.outcomes).toEqual(['Yes', 'No']);
    expect(c.eventDate).toBeInstanceOf(Date);
    expect(c.sources[0].url).toBe('https://x.test/a');
  });

  it('returns null for non-event headlines', () => {
    expect(extractCandidate({ title: 'Markets rally after earnings', link: 'https://x.test/b' }, source, now)).toBeNull();
  });

  it('leaves eventDate null when no concrete date exists (validator will block)', () => {
    const c = extractCandidate({ title: 'City council will vote on transit plan soon', link: 'https://x.test/c' }, {}, now);
    expect(c.eventDate).toBeNull();
  });
});