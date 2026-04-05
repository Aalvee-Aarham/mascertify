import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import Certificate from '../models/Certificate.js';
import Organization from '../models/Organization.js';
import Collection from '../models/Collection.js';
import PublishedCourse from '../models/PublishedCourse.js';
import AuditLog from '../models/AuditLog.js';
import ImportJob from '../models/ImportJob.js';
import { protect, orgOnly, orgApprovedForIssue } from '../middleware/auth.js';
import { getEffectiveCertificateStatus, toPublicCertificate } from '../utils/certificateStatus.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

const TEMPLATE_KEYS = ['minimal', 'academic', 'professional', 'elegant'];
const MAX_IMPORT_ROWS = 500;

function logVerificationAttempt(payload) {
  AuditLog.create({
    event: 'verification_attempt',
    certificateId: payload.certificateId || '',
    outcome: payload.outcome,
    organizationId: payload.organizationId || null,
    collectionId: payload.collectionId || null,
    publishedCourseId: payload.publishedCourseId || null,
    recipientName: payload.recipientName || '',
    recipientEmail: payload.recipientEmail || '',
  }).catch(() => {});
}

// GET /api/certificates/import/jobs/:jobId
router.get('/import/jobs/:jobId', protect, orgOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid job id' });
    }
    const org = await Organization.findOne({ userId: req.user._id });
    const job = await ImportJob.findOne({ _id: req.params.jobId, organizationId: org._id }).lean();
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/certificates/import  (multipart file)
router.post('/import', protect, orgOnly, orgApprovedForIssue, upload.single('file'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, message: 'CSV file required (field: file)' });
    }
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    let records;
    try {
      records = parse(req.file.buffer.toString('utf8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid CSV' });
    }
    if (!records.length) {
      return res.status(400).json({ success: false, message: 'CSV has no rows' });
    }
    if (records.length > MAX_IMPORT_ROWS) {
      return res.status(400).json({ success: false, message: `Maximum ${MAX_IMPORT_ROWS} rows per import` });
    }

    const job = await ImportJob.create({
      organizationId: org._id,
      createdBy: req.user._id,
      status: 'processing',
      totalRows: records.length,
    });

    res.status(202).json({ success: true, jobId: job._id, message: 'Import started' });

    const errors = [];
    let successCount = 0;

    const processRow = async (row, index) => {
      const recipientName = row.recipientName || row.recipient_name;
      const courseName = row.courseName || row.course_name;
      const issueDate = row.issueDate || row.issue_date;
      if (!recipientName || !courseName || !issueDate) {
        errors.push({ row: index + 2, message: 'recipientName, courseName, issueDate required' });
        return;
      }
      let collectionId = null;
      const cId = row.collectionId || row.collection_id;
      if (cId && mongoose.Types.ObjectId.isValid(cId)) {
        const col = await Collection.findOne({ _id: cId, organizationId: org._id });
        if (col) collectionId = col._id;
      }
      let publishedCourseId = null;
      const pId = row.publishedCourseId || row.published_course_id;
      if (pId && mongoose.Types.ObjectId.isValid(pId)) {
        const pc = await PublishedCourse.findOne({ _id: pId, organizationId: org._id });
        if (pc) publishedCourseId = pc._id;
      }
      const templateKey =
        row.templateKey || row.template_key;
      const tk = TEMPLATE_KEYS.includes(templateKey) ? templateKey : 'minimal';
      const recipientEmail = row.recipientEmail || row.recipient_email || '';
      const description = row.description || '';
      const expiryRaw = row.expiryDate || row.expiry_date || '';
      let expiryDate;
      if (expiryRaw) {
        const d = new Date(expiryRaw);
        if (!Number.isNaN(d.getTime())) expiryDate = d;
      }
      const cert = await Certificate.create({
        organizationId: org._id,
        issuedBy: req.user._id,
        recipientName: String(recipientName).trim(),
        recipientEmail: String(recipientEmail).trim().toLowerCase(),
        courseName: String(courseName).trim(),
        description: String(description).trim(),
        issueDate: new Date(issueDate),
        expiryDate,
        orgName: org.orgName,
        orgLogo: org.logo || '',
        collectionId,
        publishedCourseId,
        templateKey: tk,
      });
      const effective = getEffectiveCertificateStatus(cert);
      if (effective === 'expired') {
        await Certificate.findByIdAndUpdate(cert._id, { status: 'expired' });
      }
      successCount++;
    };

    (async () => {
      for (let i = 0; i < records.length; i++) {
        try {
          await processRow(records[i], i);
        } catch (e) {
          errors.push({ row: i + 2, message: e.message || 'Failed' });
        }
      }
      await ImportJob.findByIdAndUpdate(job._id, {
        status: 'completed',
        successCount,
        errorCount: errors.length,
        rowErrors: errors.slice(0, 200),
        completedAt: new Date(),
      });
    })().catch(console.error);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/certificates/verify/:id  — public
router.get('/verify/:id', async (req, res) => {
  const rawId = req.params.id?.trim() || '';
  const id = rawId.toUpperCase();
  try {
    const cert = await Certificate.findOne({ certificateId: id });
    if (!cert) {
      logVerificationAttempt({
        certificateId: id,
        outcome: 'not_found',
        organizationId: null,
        collectionId: null,
        publishedCourseId: null,
        recipientName: '',
        recipientEmail: '',
      });
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    const effective = getEffectiveCertificateStatus(cert);
    if (effective === 'expired' && cert.status === 'active') {
      Certificate.updateOne({ _id: cert._id }, { $set: { status: 'expired' } }).catch(() => {});
    }
    logVerificationAttempt({
      certificateId: cert.certificateId,
      outcome: 'found',
      organizationId: cert.organizationId,
      collectionId: cert.collectionId || null,
      publishedCourseId: cert.publishedCourseId || null,
      recipientName: cert.recipientName,
      recipientEmail: cert.recipientEmail,
    });
    res.json({ success: true, certificate: toPublicCertificate(cert) });
  } catch (err) {
    logVerificationAttempt({
      certificateId: id,
      outcome: 'error',
      organizationId: null,
      collectionId: null,
      publishedCourseId: null,
      recipientName: '',
      recipientEmail: '',
    });
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/certificates/me — learner's own certs
router.get('/me', protect, async (req, res) => {
  try {
    const certs = await Certificate.find({ recipientEmail: req.user.email }).sort({ issueDate: -1 });
    const certificates = certs.map((c) => toPublicCertificate(c));
    res.json({ success: true, certificates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/certificates  — org's own certs
router.get('/', protect, orgOnly, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    const q = { organizationId: org._id };
    const { collectionId } = req.query;
    if (collectionId && mongoose.Types.ObjectId.isValid(collectionId)) {
      q.collectionId = new mongoose.Types.ObjectId(collectionId);
    }
    const certs = await Certificate.find(q).sort({ createdAt: -1 });
    const certificates = certs.map((c) => toPublicCertificate(c));
    res.json({ success: true, certificates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/certificates  — create certificate
router.post('/', protect, orgOnly, orgApprovedForIssue, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    const {
      recipientName,
      recipientEmail,
      courseName,
      description,
      issueDate,
      expiryDate,
      templateKey,
      collectionId,
      publishedCourseId,
      orgLogo,
    } = req.body;
    if (!recipientName || !courseName || !issueDate)
      return res.status(400).json({ success: false, message: 'Required fields missing' });

    let colId = null;
    if (collectionId && mongoose.Types.ObjectId.isValid(collectionId)) {
      const col = await Collection.findOne({ _id: collectionId, organizationId: org._id });
      if (!col) return res.status(400).json({ success: false, message: 'Invalid collection' });
      colId = col._id;
    }
    let pubId = null;
    if (publishedCourseId && mongoose.Types.ObjectId.isValid(publishedCourseId)) {
      const pc = await PublishedCourse.findOne({ _id: publishedCourseId, organizationId: org._id });
      if (!pc) return res.status(400).json({ success: false, message: 'Invalid published course' });
      pubId = pc._id;
    }
    const tk = TEMPLATE_KEYS.includes(templateKey) ? templateKey : 'minimal';

    const cert = await Certificate.create({
      organizationId: org._id,
      issuedBy: req.user._id,
      recipientName,
      recipientEmail,
      courseName,
      description,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      orgName: org.orgName,
      orgLogo: orgLogo || org.logo || '',
      templateKey: tk,
      collectionId: colId,
      publishedCourseId: pubId,
    });
    const effective = getEffectiveCertificateStatus(cert);
    if (effective === 'expired') await Certificate.findByIdAndUpdate(cert._id, { status: 'expired' });
    const saved = await Certificate.findById(cert._id);
    const out = toPublicCertificate(saved);
    res.status(201).json({ success: true, certificate: out });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/certificates/:id/revoke
router.put('/:id/revoke', protect, orgOnly, orgApprovedForIssue, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    const cert = await Certificate.findOneAndUpdate(
      { _id: req.params.id, organizationId: org._id },
      { status: 'revoked' },
      { new: true }
    );
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    const out = toPublicCertificate(cert);
    res.json({ success: true, certificate: out });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/certificates/:id
router.delete('/:id', protect, orgOnly, orgApprovedForIssue, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    const cert = await Certificate.findOneAndDelete({ _id: req.params.id, organizationId: org._id });
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
