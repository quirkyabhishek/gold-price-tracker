import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

let prisma: PrismaClient | null = null;
let isConnected = false;

export async function initializeDatabase(): Promise<PrismaClient | null> {
  try {
    prisma = new PrismaClient({
      log: ['warn', 'error'],
    });

    await prisma.$connect();
    isConnected = true;
    logger.info('Database connected successfully');
    
    // Seed default platforms if not exist
    await seedPlatforms();
    
    return prisma;
  } catch (error) {
    logger.warn('Database connection failed - running in standalone mode:', error);
    isConnected = false;
    prisma = null;
    return null;
  }
}

export function getDatabase(): PrismaClient {
  if (!prisma) {
    throw new Error('Database not initialized');
  }
  return prisma;
}

export function isDatabaseConnected(): boolean {
  return isConnected && prisma !== null;
}

async function seedPlatforms() {
  if (!prisma) return;
  
  const platforms = [
    // E-commerce
    { name: 'flipkart', displayName: 'Flipkart', baseUrl: 'https://www.flipkart.com', category: 'ECOMMERCE', priority: 1 },
    { name: 'amazon', displayName: 'Amazon India', baseUrl: 'https://www.amazon.in', category: 'ECOMMERCE', priority: 1 },
    { name: 'myntra', displayName: 'Myntra', baseUrl: 'https://www.myntra.com', category: 'ECOMMERCE', priority: 2 },
    { name: 'ajio', displayName: 'AJIO', baseUrl: 'https://www.ajio.com', category: 'ECOMMERCE', priority: 2 },
    { name: 'tatacliq', displayName: 'Tata CLiQ', baseUrl: 'https://www.tatacliq.com', category: 'ECOMMERCE', priority: 2 },
    
    // Jewellery Brands
    { name: 'tanishq', displayName: 'Tanishq', baseUrl: 'https://www.tanishq.co.in', category: 'JEWELLERY', priority: 1 },
    { name: 'malabar', displayName: 'Malabar Gold & Diamonds', baseUrl: 'https://www.malabargoldanddiamonds.com', category: 'JEWELLERY', priority: 1 },
    { name: 'kalyan', displayName: 'Kalyan Jewellers', baseUrl: 'https://www.kalyanjewellers.net', category: 'JEWELLERY', priority: 1 },
    { name: 'joyalukkas', displayName: 'Joyalukkas', baseUrl: 'https://www.joyalukkas.in', category: 'JEWELLERY', priority: 1 },
    { name: 'png', displayName: 'PNG Jewellers', baseUrl: 'https://www.pngjewellers.com', category: 'JEWELLERY', priority: 2 },
    { name: 'bhima', displayName: 'Bhima Jewellers', baseUrl: 'https://www.bhimajewellers.com', category: 'JEWELLERY', priority: 2 },
    { name: 'whp', displayName: 'WHP Jewellers', baseUrl: 'https://www.shopwhp.com', category: 'JEWELLERY', priority: 2 },
    { name: 'gullak', displayName: 'Gullak', baseUrl: 'https://www.gullak.money', category: 'JEWELLERY', priority: 2 },
    
    // Gold Dealers
    { name: 'muthoot', displayName: 'Muthoot Gold', baseUrl: 'https://www.muthootgoldpoint.com', category: 'GOLD_DEALER', priority: 1 },
    
    // Quick Commerce
    { name: 'zepto', displayName: 'Zepto', baseUrl: 'https://www.zeptonow.com', category: 'QUICK_COMMERCE', priority: 1 },
    { name: 'blinkit', displayName: 'Blinkit', baseUrl: 'https://blinkit.com', category: 'QUICK_COMMERCE', priority: 1 },
    { name: 'swiggy', displayName: 'Swiggy Instamart', baseUrl: 'https://www.swiggy.com/instamart', category: 'QUICK_COMMERCE', priority: 1 },
    { name: 'bigbasket', displayName: 'BigBasket', baseUrl: 'https://www.bigbasket.com', category: 'QUICK_COMMERCE', priority: 2 },
    { name: 'flipkartminutes', displayName: 'Flipkart Minutes', baseUrl: 'https://www.flipkart.com/minutes', category: 'QUICK_COMMERCE', priority: 1 },
  ];

  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { name: platform.name },
      update: { 
        displayName: platform.displayName,
        baseUrl: platform.baseUrl,
        category: platform.category as any,
        priority: platform.priority,
      },
      create: platform as any,
    });
  }
  
  logger.info(`Seeded ${platforms.length} platforms`);
}

export { prisma };
