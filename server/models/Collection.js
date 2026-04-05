import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['course', 'event', 'cohort', 'other'],
    default: 'course',
  },
  metadata: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

collectionSchema.index({ organizationId: 1, createdAt: -1 });

export default mongoose.model('Collection', collectionSchema);
