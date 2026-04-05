import express from 'express';
import multer from 'multer';
import Organization from '../models/Organization.js';
import { protect, orgOnly } from '../middleware/auth.js';
import { uploadBuffer, isCloudinaryConfigured } from '../utils/cloudinaryUpload.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Image upload requires Cloudinary env vars (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)',
      });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, message: 'file field required' });
    }

    const context = req.body.context || 'org';
    let folder = 'mascertify/temp';

    if (req.user.role === 'user') {
      folder = `mascertify/users/${req.user._id}`;
    } else {
      const org = await Organization.findOne({ userId: req.user._id });
      if (!org && req.user.role !== 'admin') {
         return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      folder = context === 'course_hero'
        ? `mascertify/courses/${org?._id || 'admin'}`
        : `mascertify/orgs/${org?._id || 'admin'}`;
    }

    const result = await uploadBuffer(req.file.buffer, req.file.mimetype, folder);
    res.json({ success: true, url: result.url, publicId: result.publicId });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
