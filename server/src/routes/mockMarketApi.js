import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

// Demo stand-in for the OmniMarketX market-creation API.
const router = Router();
const seen = new Map(); // Idempotency-Key -> market

const schema = z.object({
  candidateId: z.string(),
  question: z.string().min(5),
  category: z.string(),
  description: z.string().optional(),
  outcomes: z.array(z.string()).min(2),
  closesAt: z.coerce.date(),
  eventTime: z.coerce.date(),
  resolution: z.object({ criteria: z.string().min(10), source: z.string().url() }),
  sources: z.array(z.string().url()).min(1),
});

router.post('/markets', (req, res) => {
  const key = req.get('idempotency-key');
  if (key && seen.has(key)) return res.status(200).json(seen.get(key));

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid market payload', details: parsed.error.flatten() });
  }
  const market = {
    id: `mkt_${randomUUID().slice(0, 8)}`,
    status: 'open',
    createdAt: new Date().toISOString(),
    ...parsed.data,
  };
  if (key) seen.set(key, market);
  res.status(201).json(market);
});

export default router;