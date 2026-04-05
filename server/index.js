import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import certificateRoutes from './routes/certificates.js';
import adminRoutes from './routes/admin.js';
import collectionRoutes from './routes/collections.js';
import mediaRoutes from './routes/media.js';
import organizationRoutes from './routes/organizations.js';
import discoverRoutes from './routes/discover.js';
import orgPublishedCourseRoutes from './routes/orgPublishedCourses.js';
import embedRoutes from './routes/embed.js';
import User from './models/User.js';

dotenv.config();

async function promoteAdminsFromEnv() {
  const emails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!emails.length) return;
  const result = await User.updateMany({ email: { $in: emails } }, { $set: { role: 'admin' } });
  if (result.modifiedCount > 0) {
    console.log(`🔑 Promoted ${result.modifiedCount} user(s) to admin (ADMIN_EMAILS)`);
  }
}

const app = express();

// Manual CORS — allows all origins, handles preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.set('trust proxy', 1);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'MAScertify' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/org/published-courses', orgPublishedCourseRoutes);
app.use('/api/embed', embedRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: err.message });
});

// Connect DB & start
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'mascertify',
  serverSelectionTimeoutMS: 5000,
})
  .then(async () => {
    await promoteAdminsFromEnv();
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`✅ MongoDB connected — database: mascertify`);
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });