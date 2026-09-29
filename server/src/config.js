import 'dotenv/config';

const port = Number(process.env.PORT) || 5000;

export const config = {
  port,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/omnimarketx',
  reviewerKey: process.env.REVIEWER_KEY || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  marketApiUrl: process.env.MARKET_API_URL || `http://localhost:${port}/mock-market-api`,
  useSampleData: process.env.USE_SAMPLE_DATA === 'true',
};