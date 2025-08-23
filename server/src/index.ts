import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { configureExpress } from './config/express';

// Load environment variables - fix the path for Docker
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '../.env' });

const app = express();
const PORT = process.env.PORT || 8000;
console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 Using PORT:', PORT, 'from env:', process.env.PORT);
console.log('🔧 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Configure Express middleware
configureExpress(app);

// Database connection with better error handling
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/islamic-prayer-tools';
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      // Remove deprecated options that might cause issues
    });
    
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit in production, continue without DB for health checks
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    return false;
  }
};

// Root route redirect
app.get('/', (req, res) => {
  res.json({
    message: 'Islamic Prayer Tools API',
    endpoints: {
      health: '/api/health',
      status: 'running'
    },
    timestamp: new Date().toISOString()
  });
});

// Enhanced health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'Islamic Prayer Tools API is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'development'
  });
});

// Additional health endpoint (Railway sometimes checks different paths)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'islamic-prayer-api',
    timestamp: new Date().toISOString()
  });
});

// Catch-all error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with better error handling
const startServer = async () => {
  try {
    // Try to connect to DB but don't fail if it's not available
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
      console.log('⚠️  Starting server without database connection');
    }
    
    // Listen on all interfaces (0.0.0.0) for Railway
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
      console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('✅ Server shut down successfully');
          process.exit(0);
        });
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

startServer().catch(console.error);