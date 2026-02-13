'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, TrendingDown } from 'lucide-react';
import { useState } from 'react';

interface Deal {
  product: {
    id: string;
    name: string;
    weight: number;
    productUrl: string;
  };
  platform: {
    displayName: string;
  };
  price: number;
  pricePerGram: number;
  premiumPercent: number;
}

interface AlertBannerProps {
  deals: Deal[];
}

export function AlertBanner({ deals }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const bestDeal = deals[0];

  if (dismissed || !bestDeal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative bg-gradient-to-r from-gold-500/20 via-gold-400/20 to-gold-500/20 border border-gold-500/50 rounded-xl p-4 overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/10 to-transparent animate-pulse" />
        
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl animate-bounce">🔥</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gold-500">
                  Deal Alert: {Math.abs(bestDeal.premiumPercent).toFixed(1)}% Below Spot!
                </h3>
                <TrendingDown className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-zinc-300 mt-1">
                {bestDeal.product.name} ({bestDeal.product.weight}g) on {bestDeal.platform.displayName}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                ₹{bestDeal.pricePerGram.toFixed(2)}/g • Total: ₹{bestDeal.price.toLocaleString('en-IN')}
                {deals.length > 1 && ` • +${deals.length - 1} more deals`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={bestDeal.product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black font-semibold rounded-lg transition-colors"
            >
              Buy Now <ExternalLink size={16} />
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
