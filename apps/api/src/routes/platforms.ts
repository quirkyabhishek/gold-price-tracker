import { Router, Request, Response } from 'express';
import { getDatabase, isDatabaseConnected } from '../services/database.js';
import { getCached, setCache } from '../services/redis.js';
import { getTrackedPlatforms } from '../services/realTimePriceFetcher.js';

const router = Router();

// Get platforms dynamically from the real-time price fetcher
function getDefaultPlatforms() {
  return getTrackedPlatforms();
}

// Get all platforms
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    if (!isDatabaseConnected()) {
      return res.json(getDefaultPlatforms());
    }
    
    // Try cache first
    const cached = await getCached('platforms:all');
    if (cached) {
      return res.json(cached);
    }
    
    const prisma = getDatabase();
    
    const platforms = await prisma.platform.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'asc' },
        { displayName: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        displayName: true,
        baseUrl: true,
        logoUrl: true,
        category: true,
        _count: {
          select: {
            products: {
              where: { isAvailable: true },
            },
          },
        },
      },
    });
    
    const formattedPlatforms = platforms.map((p: typeof platforms[number]) => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      baseUrl: p.baseUrl,
      logoUrl: p.logoUrl,
      category: p.category,
      productCount: p._count.products,
    }));
    
    // Cache for 5 minutes
    await setCache('platforms:all', formattedPlatforms, 300);
    
    res.json(formattedPlatforms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get platforms' });
  }
});

// Get platform by name
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const platformName = req.params.name;
    
    // Check database connection
    if (!isDatabaseConnected()) {
      const platform = getDefaultPlatforms().find(p => p.name === platformName);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      return res.json({ ...platform, products: [] });
    }
    
    const prisma = getDatabase();
    
    const platform = await prisma.platform.findUnique({
      where: { name: platformName },
      include: {
        products: {
          where: { isAvailable: true },
          include: {
            priceHistory: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
          take: 50,
        },
      },
    });
    
    if (!platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    res.json(platform);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get platform' });
  }
});

// Get platforms by category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const prisma = getDatabase();
    const category = req.params.category.toUpperCase();
    
    const platforms = await prisma.platform.findMany({
      where: { 
        category: category as any,
        isActive: true,
      },
      orderBy: { priority: 'asc' },
    });
    
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get platforms' });
  }
});

export default router;
