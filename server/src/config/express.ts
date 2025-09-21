import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import routes
import authRoutes from '../routes/auth';
import publicEventsRoutes from '../routes/public/events';
import adminEventsRoutes from '../routes/admin/events';
import staffEventsRoutes from '../routes/staff/events';
import publicContactRoutes from '../routes/public/contact';
import staffContactRoutes from '../routes/staff/contact';
import adminContactRoutes from '../routes/admin/contact';
import publicMapsRoutes from '../routes/public/maps';
import publicPrayerRoutes from '../routes/public/prayer';
import publicLocationRoutes from '../routes/public/location';
import publicHadithRoutes from '../routes/public/hadith';

export const configureExpress = (app: express.Application) => {
  // Security middleware with custom CSP
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'", 
          "https://api.aladhan.com", 
          "https://api.alquran.cloud", 
          "https://maps.googleapis.com", 
          "https://places.googleapis.com",
          // Add localhost for development
          ...(isDevelopment ? ["http://localhost:3000", "http://localhost:8000"] : [])
        ],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        mediaSrc: ["'self'", "https://www.everyayah.com", "blob:", "data:"],
      },
    },
  }));
  
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  });
  app.use('/api/', limiter);

  // Body parsing and compression
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());

  // Logging
  app.use(morgan('combined'));

  // Debug logging for routes
  console.log('🔧 Registering API routes...');
  console.log('🗺️  Maps routes imported:', !!publicMapsRoutes);
  console.log('🗺️  Maps routes type:', typeof publicMapsRoutes);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/public/events', publicEventsRoutes);
  app.use('/api/admin/events', adminEventsRoutes);
  app.use('/api/staff/events', staffEventsRoutes);
  app.use('/api/public/contact', publicContactRoutes);
  app.use('/api/staff/contact', staffContactRoutes);
  app.use('/api/admin/contact', adminContactRoutes);
  
  // Maps routes with extra logging
  console.log('🗺️  Registering /api/maps routes...');
  app.use('/api/maps', publicMapsRoutes);
  console.log('🗺️  Maps routes registered successfully');
  
  app.use('/api/prayer', publicPrayerRoutes);
  app.use('/api/location', publicLocationRoutes);
  app.use('/api/hadith', publicHadithRoutes);

  // Test route to verify maps are working
  app.get('/api/maps-test', (req, res) => {
    res.json({ 
      message: 'Maps test route working',
      timestamp: new Date().toISOString()
    });
  });

  // Serve React build files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../../client/build')));
  }

  console.log('✅ All routes configured successfully');
};