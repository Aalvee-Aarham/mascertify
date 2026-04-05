import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  event: { type: String, required: true, enum: ['verification_attempt'] },
  certificateId: { type: String, trim: true, default: '' },
  outcome: { type: String, required: true, enum: ['found', 'not_found', 'error'] },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
  publishedCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'PublishedCourse', default: null },
  recipientName: { type: String, default: '' },
  recipientEmail: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ certificateId: 1, createdAt: -1 });
auditLogSchema.index({ organizationId: 1, collectionId: 1, createdAt: -1 });
auditLogSchema.index({ publishedCourseId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
