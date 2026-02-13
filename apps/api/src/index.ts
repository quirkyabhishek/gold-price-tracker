import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { logger } from './utils/logger.js';
import { initializeRedis } from './services/redis.js';
import { initializeDatabase } from './services/database.js';
import { initializeSpotPriceService } from './services/spotPrice.js';

import priceRoutes from './routes/prices.js';
import platformRoutes from './routes/platforms.js';

dotenv.config();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM - shutting down gracefully');
  process.exit(0);
});

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:4001'],
    methods: ['GET', 'POST'],
  },
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:4001'],
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ 
    name: 'Gold Price Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      spot: '/api/prices/spot',
      deals: '/api/prices/deals',
      platforms: '/api/platforms'
    }
  });
});

app.use('/api/prices', priceRoutes);
app.use('/api/platforms', platformRoutes);

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('subscribe:prices', () => {
    socket.join('price-updates');
    logger.info(`Client ${socket.id} subscribed to price updates`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

export { io };

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  try {
    logger.info('Starting Gold Price Tracker API...');
    
    await initializeDatabase();
    await initializeRedis();
    await initializeSpotPriceService();
    
    logger.info('Spot price service initialized');
    
    httpServer.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info('API Endpoints:');
      logger.info('  GET /health - Health check');
      logger.info('  GET /api/prices/spot - Current spot prices');
      logger.info('  GET /api/prices/deals - Best deals');
      logger.info('  GET /api/platforms - Monitored platforms');
    });
    
    httpServer.on('error', (error) => {
      logger.error('Server error:', error);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
