import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import certificateRoutes from './routes/certificates.js';

dotenv.config();

const app = express();

// CORS must be first — before everything else
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://mascertify-live.onrender.com',
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Handle preflight for all routes
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.set('trust proxy', 1);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'MAScertify' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);

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
  .then(() => {
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