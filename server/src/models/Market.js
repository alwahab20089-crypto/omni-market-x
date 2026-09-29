import mongoose from 'mongoose';

const MarketSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true, unique: true },
    externalId: String,
    status: String,
    payload: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Market = mongoose.model('Market', MarketSchema);