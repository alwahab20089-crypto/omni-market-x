import mongoose from 'mongoose';
import { config } from './config.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

if (!config.reviewerKey) {
  logger.error('REVIEWER_KEY is required');
  process.exit(1);
}

await mongoose.connect(config.mongoUri);
logger.info('mongo connected');

createApp().listen(config.port, () => logger.info('server listening', { port: config.port }));