import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  orgName: { type: String, required: true, trim: true },
  orgType: { type: String, enum: ['university', 'school', 'training', 'corporate', 'event', 'other'], required: true },
  website: { type: String, trim: true },
  description: { type: String, trim: true },
  logo: { type: String, default: '' },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Organization', organizationSchema);
