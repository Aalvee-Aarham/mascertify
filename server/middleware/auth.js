import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { getApprovalState } from '../utils/orgApproval.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const orgOnly = (req, res, next) => {
  if (req.user.role !== 'organization' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Organization access only' });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access only' });
  }
  next();
};

/** Use after protect + orgOnly on routes that mutate certificates (issue, import). */
export const orgApprovedForIssue = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    const approval = getApprovalState(org);
    if (!approval.isApproved) {
      return res.status(403).json({
        success: false,
        message:
          approval.status === 'rejected'
            ? `Organization not approved: ${approval.rejectionReason || 'Rejected'}`
            : 'Your organization is pending admin approval. You cannot issue certificates yet.',
        code: 'ORG_NOT_APPROVED',
        approval,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};
