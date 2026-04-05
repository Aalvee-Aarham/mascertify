import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { protect } from '../middleware/auth.js';
import { getApprovalState } from '../utils/orgApproval.js';

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/register/user
router.post('/register/user', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, role: 'user' });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/register/organization
router.post('/register/organization', async (req, res) => {
  try {
    const { name, email, password, orgName, orgType, website, description } = req.body;
    if (!name || !email || !password || !orgName || !orgType)
      return res.status(400).json({ success: false, message: 'All required fields missing' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, role: 'organization' });
    await Organization.create({
      userId: user._id,
      orgName,
      orgType,
      website,
      description,
      approved: false,
      approvalStatus: 'pending',
    });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = signToken(user._id);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const org = req.user.role === 'organization'
      ? await Organization.findOne({ userId: req.user._id })
      : null;
    res.json({
      success: true,
      user: req.user,
      organization: org,
      organizationApproval: org ? getApprovalState(org) : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, headline, profilePicture } = req.body;
    await User.findByIdAndUpdate(req.user._id, { name, headline, profilePicture });
    if (req.user.role === 'organization') {
      const { orgName, orgType, website, description, logo } = req.body;
      await Organization.findOneAndUpdate(
        { userId: req.user._id },
        { orgName, orgType, website, description, ...(logo !== undefined ? { logo: String(logo).trim() } : {}) }
      );
    }
    const updated = await User.findById(req.user._id);
    const org = req.user.role === 'organization'
      ? await Organization.findOne({ userId: req.user._id })
      : null;
    res.json({
      success: true,
      user: updated,
      organization: org,
      organizationApproval: org ? getApprovalState(org) : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
