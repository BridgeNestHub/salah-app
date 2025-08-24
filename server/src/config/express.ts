import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import routes
import publicEventsRoutes from '../routes/public/events';
import adminEventsRoutes from '../routes/admin/events';
import staffEventsRoutes from '../routes/staff/events';
import publicContactRoutes from '../routes/public/contact';
import staffContactRoutes from '../routes/staff/contact';
import publicMapsRoutes from '../routes/public/maps';

export const configureExpress = (app: express.Application) => {
  // Security middleware
  app.use(helmet());
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

  // API Routes
  app.use('/api/public/events', publicEventsRoutes);
  app.use('/api/admin/events', adminEventsRoutes);
  app.use('/api/staff/events', staffEventsRoutes);
  app.use('/api/contact', publicContactRoutes);
  app.use('/api/staff/contact', staffContactRoutes);
  app.use('/api/maps', publicMapsRoutes);

  // Serve React build files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../../client/build')));
  }
};