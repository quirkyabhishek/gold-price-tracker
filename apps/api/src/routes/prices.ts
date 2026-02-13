import { Router, Request, Response } from 'express';
import { getDatabase, isDatabaseConnected } from '../services/database.js';
import { getCurrentSpotPrice, getSpotPriceHistory, getCurrentIBJAPrice, getCombinedSpotData, getJewellerRates, fetchSpotPrice, fetchIBJAPrice, fetchJewellerRates } from '../services/spotPrice.js';
import { getCached, setCache } from '../services/redis.js';
import { fetchLivePrices, calculateDeals, generateLiveProducts } from '../services/livePriceFetcher.js';
import { getIBJABasedPrices, calculateDealsFromRealTime, getTrackedPlatforms } from '../services/realTimePriceFetcher.js';

const router = Router();

// Get current spot price (international, IBJA, and jeweller rates)
router.get('/spot', async (req: Request, res: Response) => {
  try {
    // Force refresh if requested
    const forceRefresh = req.query.force === 'true';
    if (forceRefresh) {
      await Promise.all([fetchSpotPrice(), fetchIBJAPrice(), fetchJewellerRates()]);
    }
    
    const spotPrice = getCurrentSpotPrice();
    const ibjaPrice = getCurrentIBJAPrice();
    const jewellerRates = getJewellerRates();
    
    if (!spotPrice) {
      return res.status(503).json({ error: 'Spot price not available yet' });
    }
    
    res.json({
      international: spotPrice,
      ibja: ibjaPrice,
      jewellers: jewellerRates,
      conversionNote: 'International: Yahoo Finance gold futures (GC=F) converted from USD/oz to INR/g using real-time exchange rate. 1 troy oz = 31.1035g.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get spot price' });
  }
});

// Get spot price history
router.get('/spot/history', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const history = await getSpotPriceHistory(hours);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get spot price history' });
  }
});

// Get latest deals (below or near spot price)
router.get('/deals', async (req: Request, res: Response) => {
  try {
    const spotPrice = getCurrentSpotPrice();
    const ibjaPrice = getCurrentIBJAPrice();
    const jewellerRates = getJewellerRates();
    const spotPriceINR = spotPrice?.priceINR || 7500;
    const ibjaGold999 = ibjaPrice?.gold999 || spotPriceINR;
    const source = spotPrice?.source || 'fallback';
    
    // Check if database is connected
    if (!isDatabaseConnected()) {
      // Use IBJA-based prices with platform-specific premiums
      // This is industry standard - most gold aggregators use this approach
      try {
        const products = getIBJABasedPrices(ibjaGold999);
        
        // Calculate deals relative to IBJA price  
        const deals = calculateDealsFromRealTime(products, ibjaGold999);
        // Show top 20 deals to include more platforms
        const topDeals = deals.slice(0, 20);
        
        return res.json({
          spotPrices: {
            international: {
              priceINR: spotPriceINR,
              priceUSD: spotPrice?.priceUSD || 0,
              source: source,
              timestamp: spotPrice?.timestamp || new Date(),
              note: 'Yahoo Finance GC=F futures, converted from USD/oz to INR/g (1 troy oz = 31.1035g)',
            },
            ibja: ibjaPrice ? {
              gold999: ibjaPrice.gold999,
              gold916: ibjaPrice.gold916,
              rateType: ibjaPrice.rateType,
              timestamp: ibjaPrice.timestamp,
            } : null,
            jewellers: {
              png: jewellerRates.png ? {
                gold24k: jewellerRates.png.gold24k,
                gold22k: jewellerRates.png.gold22k,
                gold18k: jewellerRates.png.gold18k,
                silver: jewellerRates.png.silver,
                source: jewellerRates.png.source,
                timestamp: jewellerRates.png.timestamp,
              } : null,
              bhima: jewellerRates.bhima ? {
                gold24k: jewellerRates.bhima.gold24k,
                gold22k: jewellerRates.bhima.gold22k,
                gold18k: jewellerRates.bhima.gold18k,
                silver: jewellerRates.bhima.silver,
                source: jewellerRates.bhima.source,
                timestamp: jewellerRates.bhima.timestamp,
              } : null,
              ibja: jewellerRates.ibja ? {
                gold24k: jewellerRates.ibja.gold24k,
                gold22k: jewellerRates.ibja.gold22k,
                gold18k: jewellerRates.ibja.gold18k,
                source: jewellerRates.ibja.source,
                timestamp: jewellerRates.ibja.timestamp,
              } : null,
            },
          },
          deals: topDeals,
          totalDeals: deals.length,
          isLive: true,
          priceSource: 'IBJA Gold 999 Rate',
          priceNote: 'Prices shown are IBJA Gold Rate + platform-specific premiums (3-6%). Click product links to verify actual prices on platform.',
        });
      } catch (fetchError) {
        console.error('Price generation error:', fetchError);
        return res.status(500).json({ error: 'Failed to generate prices' });
      }
    }
    
    const prisma = getDatabase();
    
    // Try cache first
    const cached = await getCached('deals:latest');
    if (cached) {
      return res.json(cached);
    }
    
    const maxPremium = parseFloat(req.query.maxPremium as string) || 2;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Get recent price records with good deals
    const deals = await prisma.priceRecord.findMany({
      where: {
        premiumPercent: { lte: maxPremium },
        product: { isAvailable: true },
        timestamp: { gte: new Date(Date.now() - 3600000) }, // Last hour
      },
      include: {
        product: {
          include: {
            platform: true,
          },
        },
      },
      orderBy: { premiumPercent: 'asc' },
      take: limit,
      distinct: ['productId'],
    });
    
    const formattedDeals = deals.map((record: typeof deals[number]) => ({
      id: record.id,
      product: {
        id: record.product.id,
        name: record.product.name,
        weight: record.product.weight,
        purity: record.product.purity,
        productUrl: record.product.productUrl,
        imageUrl: record.product.imageUrl,
        isAvailable: record.product.isAvailable,
      },
      platform: {
        id: record.product.platform.id,
        name: record.product.platform.name,
        displayName: record.product.platform.displayName,
        logoUrl: record.product.platform.logoUrl,
      },
      price: record.price,
      pricePerGram: record.pricePerGram,
      spotPrice: record.spotPrice,
      premiumPercent: record.premiumPercent,
      timestamp: record.timestamp,
    }));
    
    // Cache for 30 seconds
    await setCache('deals:latest', formattedDeals, 30);
    
    res.json(formattedDeals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to get deals' });
  }
});

// Get price comparison across platforms
router.get('/compare', async (req: Request, res: Response) => {
  try {
    // Check if database is connected
    if (!isDatabaseConnected()) {
      const spotPrice = getCurrentSpotPrice();
      return res.json({
        message: 'Database not connected - showing demo data',
        spotPrice: spotPrice?.priceINR || 7500,
        comparison: [],
      });
    }
    
    const prisma = getDatabase();
    const weight = parseFloat(req.query.weight as string) || 1;
    const purity = (req.query.purity as string) || '24K';
    
    // Get latest prices for products matching criteria
    const products = await prisma.product.findMany({
      where: {
        weight: { gte: weight - 0.1, lte: weight + 0.1 },
        purity,
        isAvailable: true,
      },
      include: {
        platform: true,
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
    
    const spotPrice = getCurrentSpotPrice();
    
    const comparison = products
      .filter((p: typeof products[number]) => p.priceHistory.length > 0)
      .map((product: typeof products[number]) => {
        const latestPrice = product.priceHistory[0];
        return {
          product: {
            id: product.id,
            name: product.name,
            weight: product.weight,
            purity: product.purity,
            productUrl: product.productUrl,
          },
          platform: {
            name: product.platform.name,
            displayName: product.platform.displayName,
          },
          price: latestPrice.price,
          pricePerGram: latestPrice.pricePerGram,
          premiumPercent: latestPrice.premiumPercent,
          spotPrice: spotPrice?.priceINR || latestPrice.spotPrice,
        };
      })
      .sort((a: { premiumPercent: number }, b: { premiumPercent: number }) => a.premiumPercent - b.premiumPercent);
    
    res.json({
      spotPrice: spotPrice?.priceINR,
      comparison,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compare prices' });
  }
});

export default router;
