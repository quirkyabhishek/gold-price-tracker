import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

let redis: Redis | null = null;
let isConnected = false;

export async function initializeRedis(): Promise<Redis | null> {
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('Redis max retries reached, running without Redis');
          return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      if (isConnected) {
        logger.error('Redis error:', err);
      }
      isConnected = false;
    });

    redis.on('connect', () => {
      logger.info('Redis connected');
      isConnected = true;
    });

    redis.on('close', () => {
      isConnected = false;
    });

    await redis.connect();
    isConnected = true;
    return redis;
  } catch (error) {
    logger.warn('Redis connection failed - running without cache:', error);
    isConnected = false;
    redis = null;
    return null;
  }
}

export function getRedis(): Redis | null {
  return redis;
}

export function isRedisConnected(): boolean {
  return isConnected && redis !== null;
}

// Cache helpers with graceful fallback
export async function getCached<T>(key: string): Promise<T | null> {
  if (!isConnected || !redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
  if (!isConnected || !redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Silently fail - cache is optional
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!isConnected || !redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Silently fail
  }
}

// Pub/Sub for real-time updates
export async function publishPriceUpdate(data: any): Promise<void> {
  if (!isConnected || !redis) return;
  try {
    await redis.publish('price-updates', JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

export async function publishAlert(userId: string, data: any): Promise<void> {
  if (!isConnected || !redis) return;
  try {
    await redis.publish(`alerts:${userId}`, JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

export { redis };
