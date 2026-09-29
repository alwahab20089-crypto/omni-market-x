import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Candidate } from '../models/Candidate.js';
import { requireReviewer } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateCandidate } from '../services/validator.js';
import { publishToMarketApi } from '../services/marketCreation.js';

const router = Router();

const editSchema = z
  .object({
    question: z.string().min(5).max(300),
    category: z.string().min(2).max(50),
    description: z.string().max(2000),
    outcomes: z.array(z.string().max(80)).min(2).max(10),
    eventDate: z.coerce.date().nullable(),
    closeDate: z.coerce.date().nullable(),
    resolutionCriteria: z.string().max(2000),
    resolutionSource: z.string().max(500).nullable(),
  })
  .partial();

const load = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const c = await Candidate.findById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Candidate not found' });
  req.candidate = c;
  next();
});

const revalidate = (c) => {
  c.validation = validateCandidate(c.toObject(), { duplicateOf: c.duplicateOf });
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = {};
    if (req.query.status) q.status = String(req.query.status);
    const items = await Candidate.find(q).sort({ createdAt: -1 }).limit(200).select('-history').lean();
    res.json(items);
  })
);

router.get('/:id', load, (req, res) => res.json(req.candidate));

router.patch(
  '/:id',
  requireReviewer,
  load,
  asyncHandler(async (req, res) => {
    const c = req.candidate;
    if (c.status !== 'pending_review') {
      return res.status(409).json({ error: `Cannot edit a candidate in status "${c.status}"` });
    }
    const parsed = editSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    Object.assign(c, parsed.data);
    revalidate(c);
    c.history.push({ action: 'edited', by: req.reviewer, note: `Changed: ${Object.keys(parsed.data).join(', ')}` });
    await c.save();
    res.json(c);
  })
);

router.post(
  '/:id/approve',
  requireReviewer,
  load,
  asyncHandler(async (req, res) => {
    const c = req.candidate;
    if (!['pending_review', 'approved'].includes(c.status)) {
      return res.status(409).json({ error: `Cannot approve a candidate in status "${c.status}"` });
    }
    revalidate(c);
    if (c.validation.blocking) {
      await c.save();
      return res.status(422).json({ error: 'Blocking validation errors must be fixed before approval', candidate: c });
    }
    if (c.status === 'pending_review') {
      c.status = 'approved';
      c.history.push({ action: 'approved', by: req.reviewer });
    }
    await publishToMarketApi(c, req.reviewer); // saves
    res.json(c);
  })
);

router.post(
  '/:id/reject',
  requireReviewer,
  load,
  asyncHandler(async (req, res) => {
    const c = req.candidate;
    if (c.status !== 'pending_review') {
      return res.status(409).json({ error: `Cannot reject a candidate in status "${c.status}"` });
    }
    c.status = 'rejected';
    c.history.push({ action: 'rejected', by: req.reviewer, note: String(req.body?.note || '').slice(0, 500) });
    await c.save();
    res.json(c);
  })
);

export default router;