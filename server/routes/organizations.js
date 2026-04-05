import express from 'express';
import mongoose from 'mongoose';
import Certificate from '../models/Certificate.js';
import AuditLog from '../models/AuditLog.js';
import Organization from '../models/Organization.js';
import { protect, orgOnly } from '../middleware/auth.js';

const router = express.Router();

function parseRange(query) {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from ? new Date(query.from) : new Date(to.getTime() - 30 * 86400000);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  return { from, to };
}

// GET /api/organizations/analytics
router.get('/analytics', protect, orgOnly, async (req, res) => {
  try {
    const range = parseRange(req.query);
    if (!range) return res.status(400).json({ success: false, message: 'Invalid from/to dates' });
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    const { from, to } = range;
    const collectionId = req.query.collectionId;
    const certMatch = {
      organizationId: org._id,
      createdAt: { $gte: from, $lte: to },
    };
    if (collectionId && mongoose.Types.ObjectId.isValid(collectionId)) {
      certMatch.collectionId = new mongoose.Types.ObjectId(collectionId);
    }

    const issuesAgg = await Certificate.aggregate([
      { $match: certMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const verifyMatch = {
      event: 'verification_attempt',
      outcome: 'found',
      organizationId: org._id,
      createdAt: { $gte: from, $lte: to },
    };
    if (collectionId && mongoose.Types.ObjectId.isValid(collectionId)) {
      verifyMatch.collectionId = new mongoose.Types.ObjectId(collectionId);
    }

    const verifyAgg = await AuditLog.aggregate([
      { $match: verifyMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revokedCount = await Certificate.countDocuments({
      organizationId: org._id,
      status: 'revoked',
      ...(collectionId && mongoose.Types.ObjectId.isValid(collectionId)
        ? { collectionId: new mongoose.Types.ObjectId(collectionId) }
        : {}),
    });

    res.json({
      success: true,
      range: { from: from.toISOString(), to: to.toISOString() },
      issuesByDay: issuesAgg.map((d) => ({ date: d._id, count: d.count })),
      verificationsByDay: verifyAgg.map((d) => ({ date: d._id, count: d.count })),
      revokedCertificatesTotal: revokedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/organizations/audit-logs
router.get('/audit-logs', protect, orgOnly, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({ organizationId: org._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments({ organizationId: org._id }),
    ]);

    res.json({ success: true, logs, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
