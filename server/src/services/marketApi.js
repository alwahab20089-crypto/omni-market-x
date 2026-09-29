import { config } from '../config.js';

export function toMarketPayload(c) {
  return {
    candidateId: String(c._id),
    question: c.question,
    category: c.category || 'General',
    description: c.description || '',
    outcomes: c.outcomes,
    closesAt: c.closeDate,
    eventTime: c.eventDate,
    resolution: { criteria: c.resolutionCriteria, source: c.resolutionSource },
    sources: c.sources.map((s) => s.url),
  };
}

export async function createMarket(payload) {
  const res = await fetch(`${config.marketApiUrl}/markets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': payload.candidateId },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Market API responded ${res.status}`);
  return res.json();
}