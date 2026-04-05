import express from 'express';
import PublishedCourse from '../models/PublishedCourse.js';
import Organization from '../models/Organization.js';
import AuditLog from '../models/AuditLog.js';
import { isHttpsUrl } from '../utils/sanitize.js';

const router = express.Router();

async function verificationScoresForCourses(courses) {
  if (!courses.length) return new Map();
  const ids = courses.map((c) => c._id);
  const colIds = courses.map((c) => c.linkedCollectionId).filter(Boolean);

  const [byPc, byCol] = await Promise.all([
    AuditLog.aggregate([
      {
        $match: {
          outcome: 'found',
          publishedCourseId: { $in: ids },
        },
      },
      { $group: { _id: '$publishedCourseId', count: { $sum: 1 } } },
    ]),
    colIds.length
      ? AuditLog.aggregate([
          {
            $match: {
              outcome: 'found',
              collectionId: { $in: colIds },
            },
          },
          { $group: { _id: '$collectionId', count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
  ]);

  const pcMap = Object.fromEntries(byPc.map((r) => [r._id?.toString(), r.count]));
  const colMap = Object.fromEntries(byCol.map((r) => [r._id?.toString(), r.count]));

  const scores = new Map();
  for (const c of courses) {
    const id = c._id.toString();
    let s = pcMap[id] || 0;
    if (c.linkedCollectionId) {
      s += colMap[c.linkedCollectionId.toString()] || 0;
    }
    scores.set(id, s);
  }
  return scores;
}

function serializePublicCourse(course, orgName, verifyCount, resolvedWebsite) {
  return {
    _id: course._id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description || '',
    heroImageUrl: course.heroImageUrl,
    galleryUrls: course.galleryUrls || [],
    websiteUrl: resolvedWebsite,
    orgName,
    verifyCount,
    linkedCollectionId: course.linkedCollectionId,
  };
}

// GET /api/discover/courses
router.get('/courses', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const sort = req.query.sort === 'recent' ? 'recent' : 'popular';

    const filter = { listingStatus: 'published' };
    let courses = await PublishedCourse.find(filter).sort({ createdAt: -1 }).lean();

    const orgIds = [...new Set(courses.map((c) => c.organizationId.toString()))];
    const orgs = await Organization.find({ _id: { $in: orgIds } }).select('orgName website').lean();
    const orgMap = Object.fromEntries(orgs.map((o) => [o._id.toString(), o]));

    const scores = await verificationScoresForCourses(courses);
    if (sort === 'popular') {
      courses = [...courses].sort((a, b) => {
        const diff = (scores.get(b._id.toString()) || 0) - (scores.get(a._id.toString()) || 0);
        if (diff !== 0) return diff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    const total = courses.length;
    const slice = courses.slice((page - 1) * limit, page * limit);
    const items = slice.map((c) => {
      const org = orgMap[c.organizationId.toString()];
      const website = (c.websiteUrl && isHttpsUrl(c.websiteUrl) ? c.websiteUrl : null) || (org?.website && isHttpsUrl(org.website) ? org.website : '');
      return serializePublicCourse(c, org?.orgName || 'Organization', scores.get(c._id.toString()) || 0, website);
    });

    res.json({
      success: true,
      courses: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/discover/courses/:slug
router.get('/courses/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').toLowerCase().trim();
    const course = await PublishedCourse.findOne({ slug, listingStatus: 'published' }).lean();
    if (!course) return res.status(404).json({ success: false, message: 'Not found' });
    const org = await Organization.findById(course.organizationId).select('orgName website orgType').lean();
    const scores = await verificationScoresForCourses([course]);
    const website =
      (course.websiteUrl && isHttpsUrl(course.websiteUrl) ? course.websiteUrl : null) ||
      (org?.website && isHttpsUrl(org.website) ? org.website : '');
    res.json({
      success: true,
      course: serializePublicCourse(course, org?.orgName || 'Organization', scores.get(course._id.toString()) || 0, website),
      orgType: org?.orgType,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
