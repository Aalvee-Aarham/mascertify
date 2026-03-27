import express from 'express';
import Certificate from '../models/Certificate.js';
import Organization from '../models/Organization.js';
import { protect, orgOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/certificates/verify/:id  — public
router.get('/verify/:id', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id });
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/certificates  — org's own certs
router.get('/', protect, orgOnly, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    const certs = await Certificate.find({ organizationId: org._id }).sort({ createdAt: -1 });
    res.json({ success: true, certificates: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/certificates  — create certificate
router.post('/', protect, orgOnly, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    const { recipientName, recipientEmail, courseName, description, issueDate, expiryDate } = req.body;
    if (!recipientName || !courseName || !issueDate)
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    const cert = await Certificate.create({
      organizationId: org._id,
      issuedBy: req.user._id,
      recipientName, recipientEmail, courseName, description,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      orgName: org.orgName,
      orgLogo: org.logo || ''
    });
    res.status(201).json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/certificates/:id/revoke
router.put('/:id/revoke', protect, orgOnly, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    const cert = await Certificate.findOneAndUpdate(
      { _id: req.params.id, organizationId: org._id },
      { status: 'revoked' },
      { new: true }
    );
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/certificates/:id
router.delete('/:id', protect, orgOnly, async (req, res) => {
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
