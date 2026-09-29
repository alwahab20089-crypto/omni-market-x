import dns from 'node:dns';

dns.setServers(["8.8.8.8", "1.1.1.1"]);
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import candidatesRouter from './routes/candidates.js';
import discoveryRouter from './routes/discovery.js';
import marketsRouter from './routes/markets.js';
import mockMarketApiRouter from './routes/mockMarketApi.js';
import { errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: '100kb' }));
  app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/candidates', candidatesRouter);
  app.use('/api/discovery', discoveryRouter);
  app.use('/api/markets', marketsRouter);
  app.use('/mock-market-api', mockMarketApiRouter);
  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

  if (process.env.NODE_ENV === 'production') {
    const dist = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(dist));
    app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}