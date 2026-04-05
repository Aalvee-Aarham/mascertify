import express from 'express';
import mongoose from 'mongoose';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import PublishedCourse from '../models/PublishedCourse.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { getApprovalState } from '../utils/orgApproval.js';

const router = express.Router();

// GET /api/admin/organizations
router.get('/organizations', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status && status !== 'all') {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status filter' });
      }
      if (status === 'pending') {
        q.$or = [
          { approvalStatus: 'pending' },
          { approvalStatus: { $exists: false }, approved: { $ne: true } },
        ];
      } else if (status === 'approved') {
        q.$or = [
          { approvalStatus: 'approved' },
          { approvalStatus: { $exists: false }, approved: true },
        ];
      } else {
        q.approvalStatus = 'rejected';
      }
    }
    const orgs = await Organization.find(q).sort({ createdAt: -1 }).lean();
    const userIds = orgs.map((o) => o.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select('name email').lean();
    const byId = Object.fromEntries(users.map((u) => [u._id.toString(), u]));
    const organizations = orgs.map((o) => ({
      ...o,
      contact: byId[o.userId?.toString()] || null,
      approval: getApprovalState(o),
    }));
    res.json({ success: true, organizations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/organizations/:id  body: { action: 'approve' | 'reject', rejectionReason? }
router.patch('/organizations/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid organization id' });
    }
    const { action, rejectionReason } = req.body;
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    if (action === 'approve') {
      org.approvalStatus = 'approved';
      org.approved = true;
      org.rejectionReason = undefined;
      org.reviewedAt = new Date();
      org.reviewedBy = req.user._id;
    } else if (action === 'reject') {
      org.approvalStatus = 'rejected';
      org.approved = false;
      org.rejectionReason = (rejectionReason && String(rejectionReason).trim()) || 'Rejected';
      org.reviewedAt = new Date();
      org.reviewedBy = req.user._id;
    } else {
      return res.status(400).json({ success: false, message: 'action must be approve or reject' });
    }

    await org.save();
    const plain = org.toObject();
    res.json({
      success: true,
      organization: plain,
      approval: getApprovalState(plain),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', protect, adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 40));
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(),
    ]);
    res.json({ success: true, logs, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/course-listings
router.get('/course-listings', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status && status !== 'all') q.listingStatus = status;
    const list = await PublishedCourse.find(q).sort({ submittedAt: -1, createdAt: -1 }).lean();
    const orgIds = [...new Set(list.map((c) => c.organizationId.toString()))];
    const orgs = await Organization.find({ _id: { $in: orgIds } }).select('orgName').lean();
    const orgMap = Object.fromEntries(orgs.map((o) => [o._id.toString(), o]));
    const courses = list.map((c) => ({
      ...c,
      orgName: orgMap[c.organizationId.toString()]?.orgName || '—',
    }));
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/course-listings/:id  body: { action: 'approve'|'reject'|'delist', rejectionReason? }
router.patch('/course-listings/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const { action, rejectionReason } = req.body;
    const course = await PublishedCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Not found' });

    if (action === 'approve') {
      course.listingStatus = 'published';
      course.reviewedAt = new Date();
      course.reviewedBy = req.user._id;
      course.rejectionReason = undefined;
    } else if (action === 'reject') {
      course.listingStatus = 'rejected';
      course.reviewedAt = new Date();
      course.reviewedBy = req.user._id;
      course.rejectionReason = (rejectionReason && String(rejectionReason).trim()) || 'Rejected';
    } else if (action === 'delist') {
      course.listingStatus = 'delisted';
      course.delistedAt = new Date();
      course.reviewedBy = req.user._id;
    } else {
      return res.status(400).json({ success: false, message: 'action: approve | reject | delist' });
    }
    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
