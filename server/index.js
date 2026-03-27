import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import certificateRoutes from './routes/certificates.js';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & production middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({ 
  origin: isProduction 
    ? clientUrl.split(',').map(url => url.trim()) 
    : 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Trust proxy for Render
if (isProduction) app.set('trust proxy', 1);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'MAScertify' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: isProduction ? 'Internal server error' : err.message 
  });
});

// Connect DB & start
const dbOptions = {
  dbName: 'mascertify',
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
};

mongoose.connect(process.env.MONGO_URI, dbOptions)
  .then(() => {
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log(`✅ MongoDB connected to ${mongoose.connection.name}`);
      console.log(`🚀 Server running on port ${port} [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('📴 Shutting down gracefully...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        });
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
