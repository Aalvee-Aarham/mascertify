import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, unique: true, default: () => 'MASC-' + uuidv4().split('-')[0].toUpperCase() },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
  publishedCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'PublishedCourse', default: null },
  templateKey: { type: String, enum: ['minimal', 'academic', 'professional', 'elegant'], default: 'minimal' },
  recipientName: { type: String, required: true, trim: true },
  recipientEmail: { type: String, trim: true, lowercase: true },
  courseName: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date },
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
  orgName: { type: String },
  orgLogo: { type: String },
  createdAt: { type: Date, default: Date.now },
});

certificateSchema.index({ organizationId: 1, createdAt: -1 });
certificateSchema.index({ organizationId: 1, collectionId: 1 });

export default mongoose.model('Certificate', certificateSchema);
