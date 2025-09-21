import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load environment variables first
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '../.env' });

const app = express();
const PORT = parseInt(process.env.PORT || '8000', 10);

console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 Using PORT:', PORT);

// Basic middleware first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check MUST be first
app.get('/api/health', (req, res) => {
  console.log('📍 Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    message: 'Islamic Prayer Tools API is running',
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

// Try to configure express routes (but don't fail if it errors)
try {
  const { configureExpress } = require('./config/express');
  configureExpress(app);
  console.log('✅ Express configuration loaded successfully');
} catch (error) {
  console.warn('⚠️ Express configuration failed, continuing with basic setup:', error.message);
}

// Database connection (optional)
let dbConnected = false;
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('⚠️ No MongoDB URI provided, skipping database connection');
      return;
    }
    
    console.log('🔄 Attempting MongoDB connection...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    dbConnected = true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    dbConnected = false;
  }
};

// Serve static files from React build
const buildPath = path.join(__dirname, '../../client/build');
app.use(express.static(buildPath));

// API routes come first
app.get('/api', (req, res) => {
  res.json({
    message: 'Islamic Prayer Tools API',
    status: 'running',
    endpoints: {
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});



// Start server
const startServer = async () => {
  try {
    // Try connecting to database (don't fail if it doesn't work)
    try {
      await connectDB();
    } catch (dbError) {
      console.warn('⚠️ Database connection failed, continuing without DB:', dbError.message);
    }
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server successfully started on port ${PORT}`);
      console.log(`🔧 Health endpoint: http://0.0.0.0:${PORT}/api/health`);
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