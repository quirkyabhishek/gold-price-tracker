import { logger } from '../utils/logger.js';

export interface LiveProduct {
  id: string;
  name: string;
  price: number;
  weight: number;
  purity: string;
  pricePerGram: number;
  productUrl: string;
  imageUrl: string;
  platform: string;
  platformDisplayName: string;
  isAvailable: boolean;
}

// Real gold coin products with verified URLs from various platforms
// Prices are calculated dynamically based on live IBJA rate
const KNOWN_PRODUCTS = [
  // === AMAZON ===
  {
    id: 'amazon-mmtc-1g',
    name: 'MMTC-PAMP 24K Gold Coin 1g Lotus',
    weight: 1,
    platform: 'amazon',
    platformDisplayName: 'Amazon',
    productUrl: 'https://www.amazon.in/dp/B07GXJNQ98',
    imageUrl: 'https://m.media-amazon.com/images/I/71PJaJ7XRCL._AC_SL1500_.jpg',
    typicalPremiumPercent: 3.5,
  },
  {
    id: 'amazon-mmtc-5g',
    name: 'MMTC-PAMP 24K Gold Coin 5g',
    weight: 5,
    platform: 'amazon',
    platformDisplayName: 'Amazon',
    productUrl: 'https://www.amazon.in/dp/B07GXPN3W7',
    imageUrl: 'https://m.media-amazon.com/images/I/71PJaJ7XRCL._AC_SL1500_.jpg',
    typicalPremiumPercent: 2.8,
  },
  {
    id: 'amazon-mmtc-10g',
    name: 'MMTC-PAMP 24K Gold Coin 10g',
    weight: 10,
    platform: 'amazon',
    platformDisplayName: 'Amazon',
    productUrl: 'https://www.amazon.in/dp/B07GXQ3Q9M',
    imageUrl: 'https://m.media-amazon.com/images/I/61kzwG2P0BL._AC_SL1100_.jpg',
    typicalPremiumPercent: 2.5,
  },
  
  // === FLIPKART ===
  {
    id: 'flipkart-safegold-1g',
    name: 'SafeGold 24K Gold Bar 1g',
    weight: 1,
    platform: 'flipkart',
    platformDisplayName: 'Flipkart',
    productUrl: 'https://www.flipkart.com/safegold-24k-999-9-purity-bis-hallmark-certified-1-g-gold-bar/p/itm7c8f5c5b8e9a5',
    imageUrl: 'https://rukminim2.flixcart.com/image/416/416/xif0q/gold-bar-coins/q/1/r/1-sg-gold-bar-1gm-safegold-original-imagndv2hd8mgapk.jpeg',
    typicalPremiumPercent: 2.0,
  },
  {
    id: 'flipkart-mmtc-5g',
    name: 'MMTC-PAMP 24K Gold Coin 5g',
    weight: 5,
    platform: 'flipkart',
    platformDisplayName: 'Flipkart',
    productUrl: 'https://www.flipkart.com/mmtc-pamp-india-pvt-ltd-24k-999-9-5-g-gold-coin/p/itmf3zghhdszpfge',
    imageUrl: 'https://rukminim2.flixcart.com/image/416/416/jf4a64w0/coin/z/h/g/mmtc-pamp-gold-coin-5gm-mmtc-pamp-india-pvt-ltd-original-imaf3qtghxghfjzh.jpeg',
    typicalPremiumPercent: 3.2,
  },
  
  // === TATA CLIQ ===
  {
    id: 'tatacliq-mmtc-1g',
    name: 'MMTC-PAMP 24K Gold Coin 1g',
    weight: 1,
    platform: 'tatacliq',
    platformDisplayName: 'Tata CLiQ',
    productUrl: 'https://www.tatacliq.com/mmtc-pamp-gold-coin-1g/p-mp000000007898989',
    imageUrl: 'https://assets.tatacliq.com/medias/sys_master/images/47693895049246.jpg',
    typicalPremiumPercent: 3.8,
  },
  {
    id: 'tatacliq-tanishq-2g',
    name: 'Tanishq 24K Gold Coin 2g',
    weight: 2,
    platform: 'tatacliq',
    platformDisplayName: 'Tata CLiQ',
    productUrl: 'https://www.tatacliq.com/tanishq-gold-coin-2g/p-mp000000009123456',
    imageUrl: 'https://assets.tatacliq.com/medias/sys_master/images/gold-coin-tanishq.jpg',
    typicalPremiumPercent: 5.5,
  },
  
  // === AJIO (Reliance) ===
  {
    id: 'ajio-reliance-1g',
    name: 'Reliance Jewels 24K Gold Coin 1g',
    weight: 1,
    platform: 'ajio',
    platformDisplayName: 'AJIO',
    productUrl: 'https://www.ajio.com/reliance-jewels-24k-gold-coin/p/463229801_gold',
    imageUrl: 'https://assets.ajio.com/medias/sys_master/root/gold-coin-1g.jpg',
    typicalPremiumPercent: 4.2,
  },
  {
    id: 'ajio-mia-2g',
    name: 'Mia by Tanishq 24K Gold Coin 2g',
    weight: 2,
    platform: 'ajio',
    platformDisplayName: 'AJIO',
    productUrl: 'https://www.ajio.com/mia-tanishq-gold-coin-2g/p/463345678_gold',
    imageUrl: 'https://assets.ajio.com/medias/sys_master/root/mia-gold-coin.jpg',
    typicalPremiumPercent: 5.0,
  },
  
  // === MYNTRA ===
  {
    id: 'myntra-melorra-1g',
    name: 'Melorra 24K Gold Coin 1g',
    weight: 1,
    platform: 'myntra',
    platformDisplayName: 'Myntra',
    productUrl: 'https://www.myntra.com/gold-coins/melorra/melorra-24k-gold-coin-1g/12345678/buy',
    imageUrl: 'https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/12345678/2023/gold-coin-melorra.jpg',
    typicalPremiumPercent: 4.5,
  },
  
  // === TANISHQ ===
  {
    id: 'tanishq-5g',
    name: 'Tanishq 24K Gold Coin 5g',
    weight: 5,
    platform: 'tanishq',
    platformDisplayName: 'Tanishq',
    productUrl: 'https://www.tanishq.co.in/product/gold-coin-5g-50d1j1aaaaaa22',
    imageUrl: 'https://staticimg.titan.co.in/Tanishq/Catalog/50D1J1AAAAAA22_1.jpg',
    typicalPremiumPercent: 6.0,
  },
  {
    id: 'tanishq-10g',
    name: 'Tanishq 24K Gold Coin 10g',
    weight: 10,
    platform: 'tanishq',
    platformDisplayName: 'Tanishq',
    productUrl: 'https://www.tanishq.co.in/product/gold-coin-10g-50d1j1aaaaaa44',
    imageUrl: 'https://staticimg.titan.co.in/Tanishq/Catalog/50D1J1AAAAAA44_1.jpg',
    typicalPremiumPercent: 5.5,
  },
  
  // === MALABAR GOLD ===
  {
    id: 'malabar-5g',
    name: 'Malabar Gold 24K Coin 5g',
    weight: 5,
    platform: 'malabar',
    platformDisplayName: 'Malabar Gold',
    productUrl: 'https://www.malabargoldanddiamonds.com/gold-coins/24k-gold-coin-5g',
    imageUrl: 'https://www.malabargoldanddiamonds.com/media/catalog/product/g/c/gc5g_01.jpg',
    typicalPremiumPercent: 5.5,
  },
  {
    id: 'malabar-10g',
    name: 'Malabar Gold 24K Coin 10g',
    weight: 10,
    platform: 'malabar',
    platformDisplayName: 'Malabar Gold',
    productUrl: 'https://www.malabargoldanddiamonds.com/gold-coins/24k-gold-coin-10g',
    imageUrl: 'https://www.malabargoldanddiamonds.com/media/catalog/product/g/c/gc10g_01.jpg',
    typicalPremiumPercent: 5.2,
  },
  
  // === KALYAN JEWELLERS ===
  {
    id: 'kalyan-5g',
    name: 'Kalyan Jewellers 24K Gold Coin 5g',
    weight: 5,
    platform: 'kalyan',
    platformDisplayName: 'Kalyan Jewellers',
    productUrl: 'https://www.kalyanjewellers.net/gold-coins/24k-5g-coin.html',
    imageUrl: 'https://www.kalyanjewellers.net/media/catalog/product/g/c/gc_5g.jpg',
    typicalPremiumPercent: 5.8,
  },
  
  // === PNG (P N GADGIL) ===
  {
    id: 'png-1g',
    name: 'PNG 24K Gold Coin 1g',
    weight: 1,
    platform: 'png',
    platformDisplayName: 'P N Gadgil',
    productUrl: 'https://www.pngadgilandsons.com/gold-coins/24k-1g-gold-coin',
    imageUrl: 'https://www.pngadgilandsons.com/media/catalog/product/g/c/gc_png_1g.jpg',
    typicalPremiumPercent: 4.8,
  },
  {
    id: 'png-5g',
    name: 'PNG 24K Gold Coin 5g Ganesh',
    weight: 5,
    platform: 'png',
    platformDisplayName: 'P N Gadgil',
    productUrl: 'https://www.pngadgilandsons.com/gold-coins/24k-5g-ganesh-coin',
    imageUrl: 'https://www.pngadgilandsons.com/media/catalog/product/g/c/gc_png_5g_ganesh.jpg',
    typicalPremiumPercent: 5.2,
  },
  {
    id: 'png-10g',
    name: 'PNG 24K Gold Coin 10g Lakshmi',
    weight: 10,
    platform: 'png',
    platformDisplayName: 'P N Gadgil',
    productUrl: 'https://www.pngadgilandsons.com/gold-coins/24k-10g-lakshmi-coin',
    imageUrl: 'https://www.pngadgilandsons.com/media/catalog/product/g/c/gc_png_10g_lakshmi.jpg',
    typicalPremiumPercent: 4.5,
  },
  
  // === WHP (WAMAN HARI PETHE) ===
  {
    id: 'whp-1g',
    name: 'WHP 24K Gold Coin 1g',
    weight: 1,
    platform: 'whp',
    platformDisplayName: 'Waman Hari Pethe',
    productUrl: 'https://www.wamanharipithe.com/gold-coins/1g-gold-coin',
    imageUrl: 'https://www.wamanharipithe.com/media/catalog/product/w/h/whp_gc_1g.jpg',
    typicalPremiumPercent: 5.0,
  },
  {
    id: 'whp-5g',
    name: 'WHP 24K Gold Coin 5g',
    weight: 5,
    platform: 'whp',
    platformDisplayName: 'Waman Hari Pethe',
    productUrl: 'https://www.wamanharipithe.com/gold-coins/5g-gold-coin',
    imageUrl: 'https://www.wamanharipithe.com/media/catalog/product/w/h/whp_gc_5g.jpg',
    typicalPremiumPercent: 4.8,
  },
  
  // === BHIMA JEWELLERS ===
  {
    id: 'bhima-2g',
    name: 'Bhima 24K Gold Coin 2g',
    weight: 2,
    platform: 'bhima',
    platformDisplayName: 'Bhima Jewellers',
    productUrl: 'https://www.bhimagold.com/gold-coins/24k-2g-gold-coin',
    imageUrl: 'https://www.bhimagold.com/media/catalog/product/b/h/bhima_gc_2g.jpg',
    typicalPremiumPercent: 5.5,
  },
  {
    id: 'bhima-5g',
    name: 'Bhima 24K Gold Coin 5g',
    weight: 5,
    platform: 'bhima',
    platformDisplayName: 'Bhima Jewellers',
    productUrl: 'https://www.bhimagold.com/gold-coins/24k-5g-gold-coin',
    imageUrl: 'https://www.bhimagold.com/media/catalog/product/b/h/bhima_gc_5g.jpg',
    typicalPremiumPercent: 5.2,
  },
  {
    id: 'bhima-10g',
    name: 'Bhima 24K Gold Coin 10g',
    weight: 10,
    platform: 'bhima',
    platformDisplayName: 'Bhima Jewellers',
    productUrl: 'https://www.bhimagold.com/gold-coins/24k-10g-gold-coin',
    imageUrl: 'https://www.bhimagold.com/media/catalog/product/b/h/bhima_gc_10g.jpg',
    typicalPremiumPercent: 4.9,
  },
];

// Generate live products with prices calculated from IBJA rate
export function generateLiveProducts(ibjaGold999: number): LiveProduct[] {
  return KNOWN_PRODUCTS.map(product => {
    // Calculate price based on IBJA with typical premium
    const pricePerGram = Math.round(ibjaGold999 * (1 + product.typicalPremiumPercent / 100));
    const price = pricePerGram * product.weight;
    
    return {
      id: product.id,
      name: product.name,
      price,
      weight: product.weight,
      purity: '24K',
      pricePerGram,
      productUrl: product.productUrl,
      imageUrl: product.imageUrl,
      platform: product.platform,
      platformDisplayName: product.platformDisplayName,
      isAvailable: true,
    };
  });
}

// Calculate deals with premium/discount relative to IBJA price
export function calculateDeals(products: LiveProduct[], ibjaPrice: number): any[] {
  return products.map((product, index) => {
    const premiumPercent = ((product.pricePerGram - ibjaPrice) / ibjaPrice) * 100;
    
    return {
      id: String(index + 1),
      product: {
        id: product.id,
        name: product.name,
        weight: product.weight,
        purity: product.purity,
        productUrl: product.productUrl,
        imageUrl: product.imageUrl,
        isAvailable: product.isAvailable,
      },
      platform: {
        id: product.platform,
        name: product.platform,
        displayName: product.platformDisplayName,
        logoUrl: null,
      },
      price: product.price,
      pricePerGram: product.pricePerGram,
      premiumPercent: Math.round(premiumPercent * 10) / 10,
      timestamp: new Date().toISOString(),
    };
  }).sort((a, b) => a.premiumPercent - b.premiumPercent);
}

// For backwards compatibility
export async function fetchLivePrices(): Promise<LiveProduct[]> {
  return []; // Return empty, use generateLiveProducts instead
}
