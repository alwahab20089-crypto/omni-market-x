import mongoose from 'mongoose';

const DiscoveryRunSchema = new mongoose.Schema(
  {
    startedAt: Date,
    finishedAt: Date,
    usedFallback: { type: Boolean, default: false },
    stats: mongoose.Schema.Types.Mixed,
    errors: [{ _id: false, source: String, message: String }],
  },
  { timestamps: true }
);

export const DiscoveryRun = mongoose.model('DiscoveryRun', DiscoveryRunSchema);