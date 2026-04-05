import mongoose from 'mongoose';

const publishedCourseSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true },
  summary: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  heroImageUrl: { type: String, trim: true, default: '' },
  galleryUrls: [{ type: String, trim: true }],
  websiteUrl: { type: String, trim: true, default: '' },
  linkedCollectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
  listingStatus: {
    type: String,
    enum: ['draft', 'pending_review', 'published', 'rejected', 'delisted'],
    default: 'draft',
  },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String, trim: true },
  delistedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

publishedCourseSchema.index({ organizationId: 1, listingStatus: 1 });
publishedCourseSchema.index({ listingStatus: 1, slug: 1 });

publishedCourseSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('PublishedCourse', publishedCourseSchema);
