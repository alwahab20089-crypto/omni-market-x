const STOP = new Set(['will', 'the', 'and', 'for', 'with', 'that', 'this', 'from', 'has', 'have', 'are', 'was']);

export function tokens(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
  );
}

export function jaccard(a, b) {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

// existing: [{ _id, question, ... }]. Returns { doc, score } for the best match >= threshold.
export function findSimilar(question, existing, threshold = 0.6) {
  const t = tokens(question);
  let best = null;
  for (const doc of existing) {
    const score = jaccard(t, tokens(doc.question));
    if (score >= threshold && (!best || score > best.score)) best = { doc, score };
  }
  return best;
}