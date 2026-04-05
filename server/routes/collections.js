import express from 'express';
import mongoose from 'mongoose';
import Collection from '../models/Collection.js';
import Organization from '../models/Organization.js';
import { protect, orgOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, orgOnly, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    
    // Aggregation to get counts
    const collections = await Collection.aggregate([
      { $match: { organizationId: org._id } },
      { $lookup: {
        from: 'certificates',
        localField: '_id',
        foreignField: 'collectionId',
        as: 'certs'
      }},
      { $project: {
        _id: 1, name: 1, type: 1, metadata: 1, createdAt: 1,
        count: { $size: '$certs' }
      }},
      { $sort: { createdAt: -1 } }
    ]);
    
    res.json({ success: true, collections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/certificates', protect, orgOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const org = await Organization.findOne({ userId: req.user._id });
    const Certificate = (await import('../models/Certificate.js')).default;
    const certs = await Certificate.find({ 
      collectionId: req.params.id, 
      organizationId: org._id 
    }).sort({ createdAt: -1 });
    res.json({ success: true, certificates: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, orgOnly, async (req, res) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    const { name, type, metadata } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name required' });
    const col = await Collection.create({
      organizationId: org._id,
      name: name.trim(),
      type: type && ['course', 'event', 'cohort', 'other'].includes(type) ? type : 'course',
      metadata: metadata?.trim() || '',
    });
    res.status(201).json({ success: true, collection: col });
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
    const col = await Collection.findOne({ _id: req.params.id, organizationId: org._id });
    if (!col) return res.status(404).json({ success: false, message: 'Not found' });
    const { name, type, metadata } = req.body;
    if (name != null) col.name = String(name).trim();
    if (type && ['course', 'event', 'cohort', 'other'].includes(type)) col.type = type;
    if (metadata != null) col.metadata = String(metadata).trim();
    await col.save();
    res.json({ success: true, collection: col });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, orgOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const org = await Organization.findOne({ userId: req.user._id });
    const col = await Collection.findOneAndDelete({ _id: req.params.id, organizationId: org._id });
    if (!col) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
