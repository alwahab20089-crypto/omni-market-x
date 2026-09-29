import { Router } from 'express';
import { requireReviewer } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { runDiscovery, isRunning } from '../services/discovery.js';
import { DiscoveryRun } from '../models/DiscoveryRun.js';

const router = Router();

router.post(
  '/run',
  requireReviewer,
  asyncHandler(async (req, res) => {
    if (isRunning()) return res.status(409).json({ error: 'A discovery run is already in progress' });
    res.json(await runDiscovery());
  })
);

router.get(
  '/runs',
  asyncHandler(async (req, res) => {
    res.json(await DiscoveryRun.find().sort({ createdAt: -1 }).limit(10).lean());
  })
);

export default router;