import crypto from 'node:crypto';
import { config } from '../config.js';

function safeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function requireReviewer(req, res, next) {
  const key = req.get('x-reviewer-key');
  if (!key || !safeEqual(key, config.reviewerKey)) {
    return res.status(401).json({ error: 'Invalid or missing reviewer key' });
  }
  req.reviewer = (req.get('x-reviewer-name') || 'reviewer').slice(0, 60);
  next();
}