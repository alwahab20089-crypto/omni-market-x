import { logger } from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  logger.error('unhandled error', { path: req.path, error: err.message });
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal server error' });
}