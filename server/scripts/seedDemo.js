/**
 * Seeds demo admin, organization + learner users, published discover listings,
 * certificates, and sample verification audit rows.
 *
 * Run from repo: cd server && npm run seed:demo
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Collection from '../models/Collection.js';
import PublishedCourse from '../models/PublishedCourse.js';
import Certificate from '../models/Certificate.js';
import AuditLog from '../models/AuditLog.js';
import ImportJob from '../models/ImportJob.js';

const DEMO_EMAILS = [
  'demo-admin@mascertify.local',
  'demo-org@mascertify.local',
  'demo-learner@mascertify.local',
];

const PASSWORD = 'MascertifyDemo1!';

async function cleanup() {
  const users = await User.find({ email: { $in: DEMO_EMAILS } }).select('_id email').lean();
  if (!users.length) return;
  const userIds = users.map((u) => u._id);
  const orgs = await Organization.find({ userId: { $in: userIds } }).select('_id').lean();
  const orgIds = orgs.map((o) => o._id);

  if (orgIds.length) {
    await Certificate.deleteMany({ organizationId: { $in: orgIds } });
    await PublishedCourse.deleteMany({ organizationId: { $in: orgIds } });
    await Collection.deleteMany({ organizationId: { $in: orgIds } });
    await AuditLog.deleteMany({ organizationId: { $in: orgIds } });
    await ImportJob.deleteMany({ organizationId: { $in: orgIds } });
    await Organization.deleteMany({ _id: { $in: orgIds } });
  }
  await User.deleteMany({ _id: { $in: userIds } });
}

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in server/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || 'mascertify',
    serverSelectionTimeoutMS: 10000,
  });

  console.log('Cleaning previous demo data (if any)...');
  await cleanup();

  const admin = await User.create({
    name: 'Demo Admin',
    email: DEMO_EMAILS[0],
    password: PASSWORD,
    role: 'admin',
  });

  const orgUser = await User.create({
    name: 'Demo Org Owner',
    email: DEMO_EMAILS[1],
    password: PASSWORD,
    role: 'organization',
  });

  await User.create({
    name: 'Demo Learner',
    email: DEMO_EMAILS[2],
    password: PASSWORD,
    role: 'user',
  });

  const organization = await Organization.create({
    userId: orgUser._id,
    orgName: 'Apex Skills Institute',
    orgType: 'training',
    website: 'https://apex-skills.example.com',
    description: 'Professional certifications and skills programs (demo data).',
    logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop',
    approved: true,
    approvalStatus: 'approved',
    reviewedAt: new Date(),
    reviewedBy: admin._id,
  });

  const collection = await Collection.create({
    organizationId: organization._id,
    name: '2026 Professional Track',
    type: 'cohort',
    metadata: 'Demo cohort for certificates',
  });

  const coursesData = [
    {
      slug: 'full-stack-web-bootcamp',
      title: 'Full Stack Web Bootcamp',
      summary: 'React, Node, and MongoDB — job-ready in 12 weeks.',
      description: 'Hands-on projects, code reviews, and a capstone. Alumni hired at startups and enterprises.\n\nThis is demo content for the Discover page.',
      heroImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop',
      websiteUrl: 'https://www.udemy.com/course/the-web-developer-bootcamp/',
    },
    {
      slug: 'ui-ux-design-specialization',
      title: 'UI/UX Design Specialization',
      summary: 'Design high-fidelity prototypes and user interfaces.',
      description: 'Learn the principles of user-centered design. Master tools like Figma and Adobe XD.\n\nProfessional certificate program.',
      heroImageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=1200&h=675&fit=crop',
      websiteUrl: 'https://www.coursera.org/specializations/ui-ux-design',
    },
    {
      slug: 'graphic-design-masterclass',
      title: 'Graphic Design Masterclass',
      summary: 'Learn GREAT design with Photoshop, Illustrator, and InDesign.',
      description: 'Master the industry-standard software and design theory. Build a professional portfolio.\n\nSkillshare premium course.',
      heroImageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&h=675&fit=crop',
      websiteUrl: 'https://www.skillshare.com/classes/Graphic-Design-Masterclass-Learn-GREAT-Design/1410188034',
    },
    {
      slug: 'python-for-everybody',
      title: 'Python for Everybody',
      summary: 'Learn to Program and Analyze Data with Python.',
      description: 'The most popular Python course in the world. Basic programming to data collection.\n\nUniversity professional certificate.',
      heroImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=675&fit=crop',
      websiteUrl: 'https://www.coursera.org/specializations/python',
    },
    {
      slug: 'react-complete-guide',
      title: 'React - The Complete Guide',
      summary: 'Dive in and learn React.js from scratch!',
      description: 'Master React, Hooks, Redux, React Router, Next.js and more.\n\nBestselling Udemy course.',
      heroImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=675&fit=crop',
      websiteUrl: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
    },
    {
      slug: 'photography-essentials',
      title: 'Photography Masterclass',
      summary: 'A Complete Guide to Photography: From Beginner to Pro.',
      description: 'Learn camera settings, lighting, composition, and photo editing.\n\nTop Skillshare class.',
      heroImageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&h=675&fit=crop',
      websiteUrl: 'https://www.skillshare.com/classes/Photography-Masterclass-A-Complete-Guide-to-Photography/1655077271',
    },
  ];

  const publishedCourses = [];
  for (const c of coursesData) {
    const pc = await PublishedCourse.create({
      organizationId: organization._id,
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      description: c.description,
      heroImageUrl: c.heroImageUrl,
      websiteUrl: c.websiteUrl,
      linkedCollectionId: collection._id,
      listingStatus: 'published',
      submittedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: admin._id,
    });
    publishedCourses.push(pc);
  }

  const certRows = [
    { recipientName: 'Demo Learner', recipientEmail: DEMO_EMAILS[2], courseName: coursesData[0].title, description: 'Mastery Level', templateKey: 'professional', publishedIndex: 0 },
    { recipientName: 'Demo Learner', recipientEmail: DEMO_EMAILS[2], courseName: coursesData[1].title, description: 'Design Excellence', templateKey: 'elegant', publishedIndex: 1 },
    { recipientName: 'Demo Learner', recipientEmail: DEMO_EMAILS[2], courseName: coursesData[4].title, description: 'Frontend Specialist', templateKey: 'minimal', publishedIndex: 4 },
    { recipientName: 'Jordan Lee', recipientEmail: 'jordan@example.com', courseName: coursesData[0].title, description: 'Capstone approved', templateKey: 'academic', publishedIndex: 0 },
    { recipientName: 'Taylor Morgan', recipientEmail: 'taylor@example.com', courseName: coursesData[1].title, description: 'UI Designer Certificate', templateKey: 'minimal', publishedIndex: 1 },
    { recipientName: 'Casey Nguyen', recipientEmail: 'casey@example.com', courseName: coursesData[2].title, description: 'Creative Arts Award', templateKey: 'academic', publishedIndex: 2 },
    { recipientName: 'Riley Chen', recipientEmail: 'riley@example.com', courseName: coursesData[3].title, description: 'Python Expert', templateKey: 'minimal', publishedIndex: 3 },
    { recipientName: 'Alex Patel', recipientEmail: 'alex@example.com', courseName: coursesData[4].title, description: 'Advanced Frontend Dev', templateKey: 'academic', publishedIndex: 4 },
  ];

  const issueDate = new Date();
  issueDate.setMonth(issueDate.getMonth() - 2);
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const createdCerts = [];
  for (const row of certRows) {
    const pc = publishedCourses[row.publishedIndex];
    const cert = await Certificate.create({
      organizationId: organization._id,
      issuedBy: orgUser._id,
      collectionId: collection._id,
      publishedCourseId: pc._id,
      templateKey: row.templateKey,
      recipientName: row.recipientName,
      recipientEmail: row.recipientEmail,
      courseName: row.courseName,
      description: row.description,
      issueDate,
      expiryDate,
      status: 'active',
      orgName: organization.orgName,
      orgLogo: organization.logo || '',
    });
    createdCerts.push(cert);
  }

  // Popularity signal for Discover (verification counts)
  const auditRows = [];
  for (const pc of publishedCourses) {
    for (let i = 0; i < 15 + Math.floor(Math.random() * 10); i++) {
      const c = createdCerts.find((c) => c.publishedCourseId?.equals(pc._id));
      auditRows.push({
        event: 'verification_attempt',
        certificateId: c?.certificateId || 'MASC-DEMO',
        outcome: 'found',
        organizationId: organization._id,
        collectionId: collection._id,
        publishedCourseId: pc._id,
        recipientName: c?.recipientName || 'Demo User',
        recipientEmail: c?.recipientEmail || 'demo@example.com',
        createdAt: new Date(Date.now() - i * 3600000),
      });
    }
  }
  await AuditLog.insertMany(auditRows);

  console.log('\n========== DEMO SEED COMPLETE ==========\n');
  console.log('All accounts use the same password:\n');
  console.log(`  Password: ${PASSWORD}\n`);
  console.log('--- Admin (approve orgs, course listings, audit) ---');
  console.log(`  Email:    ${DEMO_EMAILS[0]}`);
  console.log('--- Organization (issue certs, dashboard, discover listings) ---');
  console.log(`  Email:    ${DEMO_EMAILS[1]}`);
  console.log('--- Regular user (verify-only / recipient-style demo) ---');
  console.log(`  Email:    ${DEMO_EMAILS[2]}`);
  console.log('\n--- Discover ---');
  console.log('  Open /discover — you should see 3 published programs from "Apex Skills Institute".');
  console.log('\n--- Sample certificate IDs (verify page) ---');
  createdCerts.forEach((c) => console.log(`  ${c.certificateId}  →  ${c.recipientName}`));
  console.log('\n========================================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
