import axios from 'axios';
import cron from 'node-cron';
import * as cheerio from 'cheerio';
import { getDatabase, isDatabaseConnected } from './database.js';
import { setCache, getCached, isRedisConnected } from './redis.js';
import { logger } from '../utils/logger.js';

const GOLD_API_URL = process.env.GOLD_API_URL || 'https://www.goldapi.io/api';
const GOLD_API_KEY = process.env.GOLD_API_KEY;

export interface SpotPriceData {
  priceINR: number;      // Price per gram in INR
  priceUSD: number;      // Price per gram in USD
  timestamp: Date;
  source: string;
}

export interface IBJAPriceData {
  gold999: number;    // 24K gold per gram
  gold995: number;    // 99.5% gold per gram
  gold916: number;    // 22K gold per gram
  gold750: number;    // 18K gold per gram
  timestamp: Date;
  rateType: 'opening' | 'closing';
}

// Additional jeweller rates
export interface JewellerRates {
  png?: {
    gold22k: number;   // 22K rate per gram
    gold24k: number;   // 24K (999) rate per gram
    gold24k995: number; // 24K (995) rate per gram
    gold18k: number;   // 18K rate per gram
    silver: number;    // Silver rate per gram
    timestamp: Date;
    source: string;
  };
  bhima?: {
    gold22k: number;   // 22K (916) rate per gram
    gold24k: number;   // 24K (999) rate per gram
    gold18k: number;   // 18K (750) rate per gram
    silver: number;    // Silver rate per gram
    timestamp: Date;
    source: string;
  };
  ibja?: {
    gold22k: number;   // 22K (916) rate per gram
    gold24k: number;   // 24K (999) rate per gram
    gold24k995: number; // 24K (995) rate per gram
    gold18k: number;   // 18K (750) rate per gram
    timestamp: Date;
    source: string;
  };
  kalyan?: {
    gold22k: number;   // 22K (916) rate per gram
    gold22kPerGram: number; // Per gram
    city: string;      // City for price
    timestamp: Date;
    source: string;
  };
}

export interface CombinedSpotData {
  international: SpotPriceData;
  ibja: IBJAPriceData | null;
  jewellers: JewellerRates;
}

let currentSpotPrice: SpotPriceData | null = null;
let currentIBJAPrice: IBJAPriceData | null = null;
let currentJewellerRates: JewellerRates = {};
let lastFetchTime: Date | null = null;

// Default fallback price (updated to realistic current value)
const FALLBACK_SPOT_PRICE: SpotPriceData = {
  priceINR: 14500, // Approximate 24K gold price per gram in INR (Feb 2026)
  priceUSD: 160,   // Approximate gold price per gram in USD
  timestamp: new Date(),
  source: 'fallback',
};

export async function initializeSpotPriceService(): Promise<void> {
  // Fetch initial prices
  try {
    await Promise.all([
      fetchSpotPrice(), 
      fetchIBJAPrice(),
      fetchJewellerRates(),
    ]);
  } catch (error) {
    logger.warn('Initial spot price fetch failed, using fallback:', error);
    currentSpotPrice = { ...FALLBACK_SPOT_PRICE, timestamp: new Date() };
  }
  
  // Update spot price every minute
  cron.schedule('* * * * *', async () => {
    try {
      await fetchSpotPrice();
    } catch (error) {
      logger.error('Error fetching spot price:', error);
    }
  });
  
  // Update IBJA price every 30 minutes (they update twice a day at 11:30 AM and 5:30 PM IST)
  cron.schedule('*/30 * * * *', async () => {
    try {
      await fetchIBJAPrice();
    } catch (error) {
      logger.error('Error fetching IBJA price:', error);
    }
  });
  
  // Update jeweller rates every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      await fetchJewellerRates();
    } catch (error) {
      logger.error('Error fetching jeweller rates:', error);
    }
  });
  
  logger.info('Spot price service initialized with IBJA rates and jeweller rates');
}

export async function fetchSpotPrice(): Promise<SpotPriceData> {
  try {
    let spotData: SpotPriceData;
    
    if (GOLD_API_KEY && GOLD_API_KEY !== 'your_gold_api_key') {
      // Use GoldAPI.io (recommended for production)
      spotData = await fetchFromGoldAPI();
    } else {
      // Use free sources
      spotData = await fetchFromFreeSources();
    }
    
    // Save to database if connected
    if (isDatabaseConnected()) {
      try {
        const prisma = getDatabase();
        await prisma.spotPrice.create({
          data: {
            priceINR: spotData.priceINR,
            priceUSD: spotData.priceUSD,
            source: spotData.source,
          },
        });
      } catch (dbError) {
        logger.warn('Failed to save spot price to database:', dbError);
      }
    }
    
    // Cache the current price if Redis is connected
    if (isRedisConnected()) {
      try {
        await setCache('spot-price:current', spotData, 120);
      } catch (cacheError) {
        logger.warn('Failed to cache spot price:', cacheError);
      }
    }
    
    currentSpotPrice = spotData;
    lastFetchTime = new Date();
    
    logger.info(`Spot price updated: ₹${spotData.priceINR.toFixed(2)}/g from ${spotData.source}`);
    
    return spotData;
  } catch (error) {
    logger.error('Failed to fetch spot price:', error);
    
    // Return cached price if available
    if (isRedisConnected()) {
      try {
        const cached = await getCached<SpotPriceData>('spot-price:current');
        if (cached) {
          return cached;
        }
      } catch (cacheError) {
        logger.warn('Failed to retrieve cached spot price:', cacheError);
      }
    }
    
    // Return current in-memory price or fallback
    if (currentSpotPrice) {
      return currentSpotPrice;
    }
    
    return { ...FALLBACK_SPOT_PRICE, timestamp: new Date() };
  }
}

async function fetchFromGoldAPI(): Promise<SpotPriceData> {
  const response = await axios.get(`${GOLD_API_URL}/XAU/INR`, {
    headers: {
      'x-access-token': GOLD_API_KEY,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
  
  const data = response.data;
  
  // GoldAPI returns price per ounce, convert to per gram
  // 1 troy ounce = 31.1035 grams
  const pricePerGram = data.price / 31.1035;
  
  return {
    priceINR: pricePerGram,
    priceUSD: data.price_gram_24k || data.price / 31.1035,
    timestamp: new Date(),
    source: 'goldapi.io',
  };
}

async function fetchFromFreeSources(): Promise<SpotPriceData> {
  // Multiple free sources for reliability - prioritize Yahoo Finance
  const sources = [
    fetchFromYahooFinance,
    fetchFromExchangeRateCalculation,
    fetchFromOpenExchangeRates,
    scrapeFromGoodReturns,
    scrapeFromMoneycontrol,
  ];
  
  for (const source of sources) {
    try {
      const result = await source();
      if (result && result.priceINR > 0) {
        return result;
      }
    } catch (error) {
      logger.debug(`Spot price source ${source.name} failed:`, error);
    }
  }
  
  logger.warn('All spot price sources failed, using cached/fallback');
  return currentSpotPrice || { ...FALLBACK_SPOT_PRICE, timestamp: new Date() };
}

async function fetchFromYahooFinance(): Promise<SpotPriceData> {
  // Fetch gold futures price from Yahoo Finance (GC=F) and USD/INR rate
  const [goldResponse, forexResponse] = await Promise.all([
    axios.get('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }),
    axios.get('https://api.exchangerate-api.com/v4/latest/USD', { timeout: 10000 }),
  ]);
  
  const goldData = goldResponse.data;
  const pricePerOunceUSD = goldData.chart?.result?.[0]?.meta?.regularMarketPrice;
  
  if (!pricePerOunceUSD || pricePerOunceUSD <= 0) {
    throw new Error('Invalid gold price from Yahoo Finance');
  }
  
  const usdToInr = forexResponse.data.rates?.INR || 83;
  
  // Convert from per troy ounce to per gram
  // 1 troy ounce = 31.1035 grams
  const pricePerGramUSD = pricePerOunceUSD / 31.1035;
  const pricePerGramINR = pricePerGramUSD * usdToInr;
  
  logger.info(`Yahoo Finance: Gold $${pricePerOunceUSD}/oz, USD/INR: ${usdToInr}, ₹${pricePerGramINR.toFixed(2)}/g`);
  
  return {
    priceINR: pricePerGramINR,
    priceUSD: pricePerGramUSD,
    timestamp: new Date(),
    source: 'yahoo-finance',
  };
}

async function scrapeFromGoodReturns(): Promise<SpotPriceData> {
  const response = await axios.get('https://www.goodreturns.in/gold-rates/', {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  
  const $ = cheerio.load(response.data);
  
  // GoodReturns shows gold price per 10 grams
  const priceText = $('td:contains("24 Carat")').next('td').text().trim() ||
                    $('.gold_silver_table td:contains("₹")').first().text().trim();
  
  const priceMatch = priceText.match(/[\d,]+/);
  if (!priceMatch) {
    throw new Error('Could not parse gold price from GoodReturns');
  }
  
  const pricePer10g = parseFloat(priceMatch[0].replace(/,/g, ''));
  const pricePerGram = pricePer10g / 10;
  
  return {
    priceINR: pricePerGram,
    priceUSD: pricePerGram / 83 * 31.1035, // Approximate USD conversion
    timestamp: new Date(),
    source: 'goodreturns.in',
  };
}

async function scrapeFromMoneycontrol(): Promise<SpotPriceData> {
  const response = await axios.get('https://www.moneycontrol.com/commodity/gold-price.html', {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  
  const $ = cheerio.load(response.data);
  
  // MCX Gold price per 10 grams
  const priceText = $('.pricupd span').first().text().trim() ||
                    $('[class*="commodity_price"] span').first().text().trim();
  
  const priceMatch = priceText.match(/[\d,]+\.?\d*/);
  if (!priceMatch) {
    throw new Error('Could not parse gold price from Moneycontrol');
  }
  
  const pricePer10g = parseFloat(priceMatch[0].replace(/,/g, ''));
  const pricePerGram = pricePer10g / 10;
  
  return {
    priceINR: pricePerGram,
    priceUSD: pricePerGram / 83 * 31.1035,
    timestamp: new Date(),
    source: 'moneycontrol.com',
  };
}

async function fetchFromExchangeRateCalculation(): Promise<SpotPriceData> {
  // Get USD/INR rate and international gold price
  const forexResponse = await axios.get(
    'https://api.exchangerate-api.com/v4/latest/USD',
    { timeout: 10000 }
  );
  
  const usdToInr = forexResponse.data.rates.INR || 83;
  
  // International gold price approximately (updated fallback)
  // In production, combine with a reliable gold price API
  const internationalGoldPriceUSD = 2350; // Per troy ounce - update this or fetch from another source
  
  const pricePerGramINR = (internationalGoldPriceUSD / 31.1035) * usdToInr;
  
  return {
    priceINR: pricePerGramINR,
    priceUSD: internationalGoldPriceUSD / 31.1035,
    timestamp: new Date(),
    source: 'calculated',
  };
}

async function fetchFromOpenExchangeRates(): Promise<SpotPriceData> {
  // Use Open Exchange Rates API (free tier) for currency conversion
  // Combined with approximate gold price
  const response = await axios.get(
    'https://open.er-api.com/v6/latest/USD',
    { timeout: 10000 }
  );
  
  const usdToInr = response.data.rates?.INR || 83;
  
  // Use a reasonable gold price estimate (should be replaced with real data in production)
  const goldPricePerOunceUSD = 2350;
  const pricePerGramINR = (goldPricePerOunceUSD / 31.1035) * usdToInr;
  
  return {
    priceINR: pricePerGramINR,
    priceUSD: goldPricePerOunceUSD / 31.1035,
    timestamp: new Date(),
    source: 'open.er-api',
  };
}

// Fetch IBJA (India Bullion and Jewellers Association) rates
export async function fetchIBJAPrice(): Promise<IBJAPriceData | null> {
  try {
    const response = await axios.get('https://ibjarates.com', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const html = response.data;
    
    // Extract rates using regex - IBJA displays rates per gram
    const gold999Match = html.match(/GoldRatesCompare999[^>]*>(\d+)/);
    const gold995Match = html.match(/GoldRatesCompare995[^>]*>(\d+)/);
    const gold916Match = html.match(/GoldRatesCompare916[^>]*>(\d+)/);
    const gold750Match = html.match(/GoldRatesCompare750[^>]*>(\d+)/);
    
    if (!gold999Match) {
      throw new Error('Could not parse IBJA gold 999 rate');
    }
    
    const ibjaData: IBJAPriceData = {
      gold999: parseFloat(gold999Match[1]),
      gold995: gold995Match ? parseFloat(gold995Match[1]) : 0,
      gold916: gold916Match ? parseFloat(gold916Match[1]) : 0,
      gold750: gold750Match ? parseFloat(gold750Match[1]) : 0,
      timestamp: new Date(),
      rateType: 'closing', // IBJA publishes opening and closing rates
    };
    
    currentIBJAPrice = ibjaData;
    logger.info(`IBJA rates updated: Gold 999: ₹${ibjaData.gold999}/g, Gold 916: ₹${ibjaData.gold916}/g`);
    
    return ibjaData;
  } catch (error) {
    logger.error('Failed to fetch IBJA rates:', error);
    return currentIBJAPrice; // Return cached value if available
  }
}

// Fetch rates from real jewellers
export async function fetchJewellerRates(): Promise<void> {
  await Promise.all([
    fetchPNGRates(),
    fetchBhimaRates(),
    fetchKalyanRates(),
    storeIBJAAsJewellerRate(),
  ]);
}

// Fetch from Bhima Jewellers website (real rates from their homepage)
// Tries 2 methods: JSON parsing (metalrate2) and HTML <p> tag regex
async function fetchBhimaRates(): Promise<void> {
  try {
    // Try to fetch with minimal footprint
    const response = await axios.get('https://www.bhimagold.com', {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      httpAgent: new (require('http').Agent)({ keepAlive: true }),
      httpsAgent: new (require('https').Agent)({ 
        keepAlive: true,
        rejectUnauthorized: false 
      }),
      validateStatus: () => true,
    });
    
    // Successfully fetched HTML
    if (response.status === 200 && response.data) {
      const html = response.data;
      
      let gold24k = 0;
      let gold22k = 0;
      let gold18k = 0;
      let silver = 0;
      
      // METHOD 1: Try parsing metalrate2 JSON (works on some versions)
      const jsonMatch = html.match(/"metalrate2"\s*:\s*({[\s\S]*?"rateArray"[\s\S]*?})/);
      if (jsonMatch) {
        try {
          const cleanJson = jsonMatch[1]
            .replace(/'/g, '"')
            .replace(/,\s*}/g, '}');
          const rates = JSON.parse(cleanJson);
          
          if (rates.rateArray && Array.isArray(rates.rateArray)) {
            for (const item of rates.rateArray) {
              if (!item.metal || !item.rate) continue;
              
              const rate = parseInt(item.rate.replace(/[^\d]/g, ''));
              if (rate <= 0) continue;
              
              if (item.metal.includes('22') || item.metal.includes('916')) {
                gold22k = rate;
              } else if (item.metal.includes('24') || item.metal.includes('999')) {
                gold24k = rate;
              } else if (item.metal.includes('18') || item.metal.includes('750')) {
                gold18k = rate;
              }
            }
          }
          
          if (gold24k > 0 || gold22k > 0) {
            logger.debug('✓ Bhima: JSON method (metalrate2) succeeded');
          }
        } catch (parseErr) {
          logger.debug('Bhima: JSON parsing failed, trying <p> tag method');
        }
      } else {
        logger.debug('Bhima: metalrate2 JSON not found in HTML, trying <p> tag method');
      }
      
      // METHOD 2: If JSON didn't work, parse <p> tags
      if (gold24k === 0 && gold22k === 0) {
        logger.debug('Bhima: JSON method found no rates, trying <p> tag regex method');
        const pTagPattern = /<p[^>]*>Online\s+(?:Gold|Silver)\s+Rate[^<]*<\/p>/gi;
        const pTags = html.match(pTagPattern) || [];
        
        logger.debug(`Bhima: Found ${pTags.length} <p> tags with rate information`);
        
        // Parse each p tag
        for (const pTag of pTags) {
          // Remove HTML tags
          const text = pTag.replace(/<[^>]*>/g, '').trim();
          
          // Extract rate value (number with commas)
          const rateMatch = text.match(/:\s*([\d,]+)/);
          if (!rateMatch) continue;
          
          const rate = parseInt(rateMatch[1].replace(/,/g, ''));
          
          // Determine which rate this is
          if (text.includes('24 KT') || text.includes('(999)')) {
            gold24k = rate;
          } else if (text.includes('22 KT') || text.includes('(916)')) {
            gold22k = rate;
          } else if (text.includes('18 KT') || text.includes('(750)')) {
            gold18k = rate;
          } else if (text.includes('Silver')) {
            silver = rate;
          }
        }
        
        if (gold24k > 0 || gold22k > 0) {
          logger.debug('✓ Bhima: <p> tag regex method succeeded');
        }
      }
      
      // If either method succeeded, save the rates
      if (gold24k > 0 || gold22k > 0) {
        currentJewellerRates.bhima = {
          gold22k: gold22k || gold24k,
          gold24k: gold24k || gold22k,
          gold18k: gold18k || (gold22k ? gold22k - 2400 : 0),
          silver: silver || 750,
          timestamp: new Date(),
          source: 'Bhima Jewellers (Live)',
        };
        logger.info(`✓ Bhima LIVE rates: 22K ₹${gold22k}/g, 24K ₹${gold24k}/g, 18K ₹${gold18k}/g`);
        return;
      }
      
      // If both methods failed, log it
      logger.debug('Bhima HTML loaded but neither JSON nor <p> tags parsed - using fallback');
    }
    
    // If we couldn't parse rates from HTML, use fallback
    if (!currentJewellerRates.bhima) {
      // Use actual rates from Bhima's website as shown on their UI
      currentJewellerRates.bhima = {
        gold22k: 13818,  // Actual rate from bhimagold.com (22K/916)
        gold24k: 15580,  // Actual rate from bhimagold.com (24K/999)
        gold18k: 11418,  // Calculated from 22K rate
        silver: 750,
        timestamp: new Date(),
        source: 'Bhima Jewellers (Fallback)',
      };
      logger.info('Bhima rates: Using fallback rates (22K ₹13818/g, 24K ₹15580/g)');
    }
    
  } catch (error: any) {
    logger.debug(`Bhima fetch error: ${error.message}`);
    
    // Final fallback - use actual rates from Bhima's website
    if (!currentJewellerRates.bhima) {
      currentJewellerRates.bhima = {
        gold22k: 13818,  // Actual rate from bhimagold.com
        gold24k: 15580,  // Actual rate from bhimagold.com
        gold18k: 11418,
        silver: 750,
        timestamp: new Date(),
        source: 'Bhima Jewellers (Error Fallback)',
      };
    }
  }
}

// Fetch from Kalyan Jewellers AJAX API (real rates)
async function fetchKalyanRates(): Promise<void> {
  try {
    // Kalyan requires countryId, stateId, cityId - using India/Andhra Pradesh/Guntur
    const response = await axios.post(
      'https://www.kalyanjewellers.net/kalyan_gold_rates/ajax/get_rate',
      'countryId=1&stateId=1&cityId=1',
      {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://www.kalyanjewellers.net',
          'Referer': 'https://www.kalyanjewellers.net/kalyan_gold_rates/gold-rate',
        },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      }
    );

    const data = response.data;
    
    if (data.today_22k && data.today_22k !== 'N/A') {
      // Parse "INR 14280.00" format - Kalyan prices are per gram
      const price22kMatch = data.today_22k.match(/[\d,.]+/);
      const price22kPerGram = price22kMatch ? parseFloat(price22kMatch[0].replace(/,/g, '')) : 0;
      
      if (price22kPerGram > 0) {
        currentJewellerRates.kalyan = {
          gold22k: price22kPerGram,           // Per gram
          gold22kPerGram: Math.round(price22kPerGram), // Per gram (same value)
          city: data.place_name || 'India',
          timestamp: new Date(),
          source: 'Kalyan Jewellers',
        };
        
        logger.info(`Kalyan rates: 22K ₹${price22kPerGram}/g - ${data.place_name}`);
      }
    }
  } catch (error: any) {
    logger.warn(`Kalyan rates fetch failed: ${error.message}`);
  }
}

// Fetch from PN Gadgil & Sons API (real jeweller API)
async function fetchPNGRates(): Promise<void> {
  try {
    const response = await axios.get('https://goldpriceeditor.droidinfinity.com/api/external/metal-prices/1085', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });
    
    const data = response.data;
    
    if (data.success && data.rates) {
      currentJewellerRates.png = {
        gold22k: data.rates.goldPrice22K || 0,
        gold24k: data.rates.goldPrice24K || 0,     // 999 purity
        gold24k995: data.rates.goldPrice24K995 || 0,
        gold18k: data.rates.goldPrice18K || 0,
        silver: data.rates.silverPrice || 0,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        source: 'P N Gadgil & Sons',
      };
      
      logger.info(`PNG rates: 22K ₹${data.rates.goldPrice22K}/g, 24K ₹${data.rates.goldPrice24K}/g`);
    }
  } catch (error: any) {
    logger.warn(`PNG rates fetch failed: ${error.message}`);
  }
}

// Store IBJA rates as jeweller rate for comparison
async function storeIBJAAsJewellerRate(): Promise<void> {
  if (currentIBJAPrice) {
    currentJewellerRates.ibja = {
      gold22k: currentIBJAPrice.gold916,
      gold24k: currentIBJAPrice.gold999,
      gold24k995: currentIBJAPrice.gold995,
      gold18k: currentIBJAPrice.gold750,
      timestamp: currentIBJAPrice.timestamp,
      source: 'IBJA (Official)',
    };
  }
}

export function getCurrentSpotPrice(): SpotPriceData | null {
  return currentSpotPrice;
}

export function getCurrentIBJAPrice(): IBJAPriceData | null {
  return currentIBJAPrice;
}

export function getJewellerRates(): JewellerRates {
  return currentJewellerRates;
}

export function getCombinedSpotData(): CombinedSpotData | null {
  if (!currentSpotPrice) return null;
  return {
    international: currentSpotPrice,
    ibja: currentIBJAPrice,
    jewellers: currentJewellerRates,
  };
}

export function getLastFetchTime(): Date | null {
  return lastFetchTime;
}

export async function getSpotPriceHistory(hours: number = 24): Promise<SpotPriceData[]> {
  if (!isDatabaseConnected()) {
    return currentSpotPrice ? [currentSpotPrice] : [];
  }
  
  const prisma = getDatabase();
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const records = await prisma.spotPrice.findMany({
    where: {
      timestamp: { gte: since },
    },
    orderBy: { timestamp: 'asc' },
  });
  
  return records.map((r: typeof records[number]) => ({
    priceINR: r.priceINR,
    priceUSD: r.priceUSD,
    timestamp: r.timestamp,
    source: r.source,
  }));
}

// Calculate effective price per gram including all charges
export function calculateEffectivePrice(
  totalPrice: number,
  weightGrams: number,
  makingCharges: number = 0,
  gstPercent: number = 3
): { pricePerGram: number; effectivePrice: number } {
  // Remove GST to get base price
  const priceWithoutGST = totalPrice / (1 + gstPercent / 100);
  
  // Remove making charges
  const goldValue = priceWithoutGST - makingCharges;
  
  // Calculate per gram
  const pricePerGram = goldValue / weightGrams;
  
  return {
    pricePerGram,
    effectivePrice: goldValue,
  };
}

// Calculate premium/discount over spot price
export function calculatePremium(pricePerGram: number, spotPricePerGram: number): number {
  return ((pricePerGram - spotPricePerGram) / spotPricePerGram) * 100;
}
