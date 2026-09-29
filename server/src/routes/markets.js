import { Router } from 'express';
import { Market } from '../models/Market.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await Market.find().sort({ createdAt: -1 }).limit(200).lean());
  })
);

export default router;