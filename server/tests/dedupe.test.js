import { describe, it, expect } from 'vitest';
import { findSimilar, jaccard, tokens } from '../src/services/dedupe.js';

describe('dedupe', () => {
  it('scores identical questions as 1', () => {
    const t = tokens('Will Fed cut interest rates by October 8, 2026?');
    expect(jaccard(t, t)).toBe(1);
  });

  it('finds the closest existing question above threshold', () => {
    const existing = [
      { _id: 1, question: 'Will Team A win the cup final by October 5, 2026?' },
      { _id: 2, question: 'Will Fed cut interest rates by October 8, 2026?' },
    ];
    const hit = findSimilar('Will Fed cut interest rates by October 8, 2026?', existing);
    expect(hit.doc._id).toBe(2);
    expect(hit.score).toBe(1);
  });

  it('returns null when nothing is similar', () => {
    expect(findSimilar('Will Acme release a phone by October 20, 2026?', [{ _id: 1, question: 'Will Fed cut interest rates?' }])).toBeNull();
  });
});