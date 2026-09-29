import mongoose from 'mongoose';

const SourceRefSchema = new mongoose.Schema(
  {
    title: String,
    url: { type: String, required: true },
    publisher: String,
    publishedAt: Date,
    snippet: String,
    mentionedDate: Date,
  },
  { _id: false }
);

const IssueSchema = new mongoose.Schema(
  {
    code: String,
    severity: { type: String, enum: ['error', 'warning', 'info'] },
    message: String,
  },
  { _id: false }
);

const HistorySchema = new mongoose.Schema(
  {
    action: String,
    by: String,
    note: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CandidateSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    category: String,
    description: String,
    outcomes: { type: [String], default: ['Yes', 'No'] },
    eventDate: Date,
    closeDate: Date,
    resolutionCriteria: String,
    resolutionSource: String,
    sources: { type: [SourceRefSchema], default: [] },
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected', 'created'],
      default: 'pending_review',
      index: true,
    },
    validation: {
      issues: { type: [IssueSchema], default: [] },
      score: Number,
      blocking: Boolean,
      checkedAt: Date,
    },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    discoveryCount: { type: Number, default: 1 },
    marketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Market' },
    creationError: String,
    history: { type: [HistorySchema], default: [] },
  },
  { timestamps: true }
);

CandidateSchema.index({ 'sources.url': 1 });

export const Candidate = mongoose.model('Candidate', CandidateSchema);