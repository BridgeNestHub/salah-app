import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { configureExpress } from './config/express';

// Load environment variables from root directory
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 8000;
console.log('🔧 Using PORT:', PORT, 'from env:', process.env.PORT);

// Configure Express middleware
configureExpress(app);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/islamic-prayer-tools');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Root route redirect
app.get('/', (req, res) => {
  res.json({
    message: 'Islamic Prayer Tools API',
    endpoints: {
      health: '/api/health',
      frontend: 'http://localhost:3000'
    }
  });
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Islamic Prayer Tools API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:3000`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
  });
};

startServer().catch(console.error);