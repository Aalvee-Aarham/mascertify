import mongoose from 'mongoose';

const importJobSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  },
  totalRows: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  rowErrors: [{ row: Number, message: String }],
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

importJobSchema.index({ organizationId: 1, createdAt: -1 });

export default mongoose.model('ImportJob', importJobSchema);
