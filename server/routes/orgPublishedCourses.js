import express from 'express';
import mongoose from 'mongoose';
import PublishedCourse from '../models/PublishedCourse.js';
import Collection from '../models/Collection.js';
import Organization from '../models/Organization.js';
import { protect, orgOnly } from '../middleware/auth.js';
import { isHttpsUrl } from '../utils/sanitize.js';

function slugify(s) {
  const base = String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
  return base || 'course';
}

async function uniqueSlugFromTitle(title) {
  let base = slugify(title);
  let slug = base;
  let n = 0;
  while (await PublishedCourse.exists({ slug })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

const router = express.Router();

router.get('/', protect, orgOnly, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    const list = await PublishedCourse.find({ organizationId: org._id }).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, courses: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, orgOnly, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    const { title, summary, description, heroImageUrl, galleryUrls, websiteUrl, linkedCollectionId } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'title required' });
    if (websiteUrl && !isHttpsUrl(websiteUrl)) {
      return res.status(400).json({ success: false, message: 'websiteUrl must be https' });
    }
    if (linkedCollectionId) {
      if (!mongoose.Types.ObjectId.isValid(linkedCollectionId)) {
        return res.status(400).json({ success: false, message: 'Invalid collection' });
      }
      const col = await Collection.findOne({ _id: linkedCollectionId, organizationId: org._id });
      if (!col) return res.status(400).json({ success: false, message: 'Collection not found' });
    }
    const slug = await uniqueSlugFromTitle(title);
    const course = await PublishedCourse.create({
      organizationId: org._id,
      slug,
      title: title.trim(),
      summary: (summary || '').trim(),
      description: (description || '').trim(),
      heroImageUrl: (heroImageUrl || '').trim(),
      galleryUrls: Array.isArray(galleryUrls) ? galleryUrls.filter(Boolean).slice(0, 12) : [],
      websiteUrl: (websiteUrl || '').trim(),
      linkedCollectionId: linkedCollectionId || null,
      listingStatus: 'draft',
    });
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id', protect, orgOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const org = await Organization.findOne({ userId: req.user._id });
    const course = await PublishedCourse.findOne({ _id: req.params.id, organizationId: org._id });
    if (!course) return res.status(404).json({ success: false, message: 'Not found' });
    if (['published', 'pending_review'].includes(course.listingStatus)) {
      const allowed = ['title', 'summary', 'description', 'heroImageUrl', 'galleryUrls', 'websiteUrl', 'linkedCollectionId'];
      for (const k of Object.keys(req.body)) {
        if (!allowed.includes(k)) delete req.body[k];
      }
    }
    const {
      title,
      summary,
      description,
      heroImageUrl,
      galleryUrls,
      websiteUrl,
      linkedCollectionId,
      action,
    } = req.body;

    if (title != null) course.title = String(title).trim();
    if (summary != null) course.summary = String(summary).trim();
    if (description != null) course.description = String(description).trim();
    if (heroImageUrl != null) course.heroImageUrl = String(heroImageUrl).trim();
    if (galleryUrls != null) {
      course.galleryUrls = Array.isArray(galleryUrls) ? galleryUrls.filter(Boolean).slice(0, 12) : [];
    }
    if (websiteUrl != null) {
      const w = String(websiteUrl).trim();
      if (w && !isHttpsUrl(w)) return res.status(400).json({ success: false, message: 'websiteUrl must be https' });
      course.websiteUrl = w;
    }
    if (linkedCollectionId !== undefined) {
      if (!linkedCollectionId) {
        course.linkedCollectionId = null;
      } else if (mongoose.Types.ObjectId.isValid(linkedCollectionId)) {
        const col = await Collection.findOne({ _id: linkedCollectionId, organizationId: org._id });
        if (!col) return res.status(400).json({ success: false, message: 'Collection not found' });
        course.linkedCollectionId = col._id;
      }
    }

    if (action === 'submit_review') {
      if (!['draft', 'rejected'].includes(course.listingStatus)) {
        return res.status(400).json({ success: false, message: 'Cannot submit from current state' });
      }
      course.listingStatus = 'pending_review';
      course.submittedAt = new Date();
      course.rejectionReason = undefined;
    } else if (action === 'unpublish_draft') {
      if (course.listingStatus !== 'published' && course.listingStatus !== 'pending_review') {
        return res.status(400).json({ success: false, message: 'Nothing to unpublish' });
      }
      course.listingStatus = 'draft';
    }

    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
