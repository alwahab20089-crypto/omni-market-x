import { Market } from '../models/Market.js';
import { createMarket, toMarketPayload } from './marketApi.js';
import { logger } from '../utils/logger.js';

// Called only after human approval. On failure the candidate stays "approved"
// with creationError set; approving again retries (idempotent on candidateId).
export async function publishToMarketApi(candidate, by) {
  try {
    const payload = toMarketPayload(candidate);
    const result = await createMarket(payload);
    const market = await Market.findOneAndUpdate(
      { candidateId: candidate._id },
      { $setOnInsert: { candidateId: candidate._id, externalId: result.id, status: result.status, payload } },
      { upsert: true, new: true }
    );
    candidate.status = 'created';
    candidate.marketId = market._id;
    candidate.creationError = null;
    candidate.history.push({ action: 'market_created', by, note: result.id });
  } catch (err) {
    logger.error('market creation failed', { candidateId: String(candidate._id), error: err.message });
    candidate.creationError = err.message;
    candidate.history.push({ action: 'market_creation_failed', by, note: err.message });
  }
  await candidate.save();
  return candidate;
}