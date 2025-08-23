import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { configureExpress } from './config/express';

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '../.env' });

const app = express();
const PORT = parseInt(process.env.PORT || '8000', 10);

console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 Using PORT:', PORT);

// Configure Express middleware and routes
configureExpress(app);

// Database connection
let dbConnected = false;
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/islamic-prayer-tools';
    console.log('🔄 Attempting MongoDB connection...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    dbConnected = true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    dbConnected = false;
  }
};

// Health check routes (MUST BE FIRST)
app.get('/api/health', (req, res) => {
  console.log('📍 Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    message: 'Islamic Prayer Tools API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/health', (req, res) => {
  console.log('📍 Simple health check requested');
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Islamic Prayer Tools API',
    status: 'running',
    endpoints: {
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Start server
const startServer = async () => {
  try {
    // Try connecting to database (don't fail if it doesn't work)
    await connectDB();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server successfully started on port ${PORT}`);
      console.log(`🔧 Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`📊 Database status: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        if (dbConnected) {
          mongoose.connection.close(() => {
            console.log('✅ Database connection closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('🚀 Starting Islamic Prayer Tools API...');
startServer();