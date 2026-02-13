/**
 * Calculate price variance alerts when delta exceeds configured threshold
 */

export interface PriceAlert {
  type: 'ibja-vs-yahoo' | 'ibja-vs-png' | 'ibja-vs-bhima' | 'ibja-vs-kalyan';
  delta: number;
  comparison: string;
  ibjaPrice: number;
  otherPrice: number;
}

interface SpotPriceData {
  international?: {
    priceINR: number;
  };
  ibja?: {
    gold999: number;
  } | null;
  jewellers?: {
    png?: {
      gold24k: number;
    } | null;
    bhima?: {
      gold24k: number;
    } | null;
    kalyan?: {
      gold22kPerGram: number;
    } | null;
  };
}

/**
 * Configurable threshold for price variance alerts (in percentage)
 * Change this value to adjust when alerts trigger
 * Example: 8 = alert when difference is >= 8%
 */
export const PRICE_ALERT_THRESHOLD = 8;

export function calculatePriceAlerts(spotPrices: SpotPriceData): PriceAlert[] {
  const alerts: PriceAlert[] = [];

  if (!spotPrices?.ibja?.gold999) {
    return alerts;
  }

  const ibjaPrice = spotPrices.ibja.gold999;

  // IBJA vs Yahoo Finance
  if (spotPrices.international?.priceINR) {
    const yahooPrice = spotPrices.international.priceINR;
    const delta = Math.abs(((yahooPrice - ibjaPrice) / ibjaPrice) * 100);

    if (delta > PRICE_ALERT_THRESHOLD) {
      alerts.push({
        type: 'ibja-vs-yahoo',
        delta,
        comparison: 'Yahoo Finance',
        ibjaPrice,
        otherPrice: yahooPrice,
      });
    }
  }

  // IBJA vs PNG
  if (spotPrices.jewellers?.png?.gold24k) {
    const pngPrice = spotPrices.jewellers.png.gold24k;
    const delta = Math.abs(((pngPrice - ibjaPrice) / ibjaPrice) * 100);

    if (delta > PRICE_ALERT_THRESHOLD) {
      alerts.push({
        type: 'ibja-vs-png',
        delta,
        comparison: 'PNG',
        ibjaPrice,
        otherPrice: pngPrice,
      });
    }
  }

  // IBJA vs Bhima
  if (spotPrices.jewellers?.bhima?.gold24k) {
    const bhimaPrice = spotPrices.jewellers.bhima.gold24k;
    const delta = Math.abs(((bhimaPrice - ibjaPrice) / ibjaPrice) * 100);

    if (delta > PRICE_ALERT_THRESHOLD) {
      alerts.push({
        type: 'ibja-vs-bhima',
        delta,
        comparison: 'Bhima',
        ibjaPrice,
        otherPrice: bhimaPrice,
      });
    }
  }

  // IBJA vs Kalyan (convert 22K to 24K for comparison)
  if (spotPrices.jewellers?.kalyan?.gold22kPerGram) {
    // Estimate 24K from 22K: 24K ≈ (22K / 22) * 24
    const kalyan24kEstimate = (spotPrices.jewellers.kalyan.gold22kPerGram / 22) * 24;
    const delta = Math.abs(((kalyan24kEstimate - ibjaPrice) / ibjaPrice) * 100);

    if (delta > PRICE_ALERT_THRESHOLD) {
      alerts.push({
        type: 'ibja-vs-kalyan',
        delta,
        comparison: 'Kalyan',
        ibjaPrice,
        otherPrice: kalyan24kEstimate,
      });
    }
  }

  // Sort by delta (highest first)
  alerts.sort((a, b) => b.delta - a.delta);

  return alerts;
}
