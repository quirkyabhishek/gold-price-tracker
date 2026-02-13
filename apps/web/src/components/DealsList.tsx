'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, TrendingDown, Clock, Package, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface Deal {
  id: string;
  product: {
    id: string;
    name: string;
    weight: number;
    purity: string;
    productUrl: string;
    imageUrl?: string;
    isAvailable: boolean;
  };
  platform: {
    id: string;
    name: string;
    displayName: string;
    logoUrl?: string;
  };
  price: number;
  pricePerGram: number;
  spotPrice: number;
  premiumPercent: number;
  priceSource?: 'ibja-estimate' | 'api' | 'scraped';  // Where the price came from
  premiumApplied?: number;  // Premium % added to IBJA rate
  timestamp?: string;
}

interface DealsListProps {
  deals: Deal[];
  isLoading: boolean;
  spotPrice?: number;
}

export function DealsList({ deals, isLoading, spotPrice }: DealsListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl p-4 animate-pulse">
            <div className="h-6 bg-zinc-800 rounded mb-4 w-3/4"></div>
            <div className="h-20 bg-zinc-800 rounded mb-4"></div>
            <div className="h-8 bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-zinc-400">No deals found</h3>
        <p className="text-zinc-500 mt-2">
          We're scanning for gold coins below spot price. Check back soon!
        </p>
      </div>
    );
  }

  // Sort by premium (best deals first)
  const sortedDeals = [...deals].sort((a, b) => a.premiumPercent - b.premiumPercent);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {sortedDeals.map((deal, index) => (
          <DealCard key={deal.product.id} deal={deal} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  const { product, platform, price, pricePerGram, premiumPercent, spotPrice, priceSource, premiumApplied } = deal;
  const isBelowSpot = premiumPercent < 0;
  const savings = isBelowSpot ? (spotPrice - pricePerGram) * product.weight : 0;

  return (
    <motion.a
      href={product.productUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={`block bg-zinc-900 rounded-xl overflow-hidden border transition-all hover:scale-[1.02] hover:shadow-xl ${
        isBelowSpot
          ? 'border-gold-500/50 hover:border-gold-500 deal-highlight'
          : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Header badge */}
      <div className={`px-4 py-2 flex items-center justify-between ${
        isBelowSpot ? 'bg-gold-500/20' : 'bg-zinc-800'
      }`}>
        <span className={`text-sm font-semibold ${
          isBelowSpot ? 'text-gold-500' : 'text-zinc-400'
        }`}>
          {isBelowSpot ? (
            <span className="flex items-center gap-1">
              <TrendingDown size={14} />
              {Math.abs(premiumPercent).toFixed(1)}% BELOW SPOT
            </span>
          ) : (
            `+${premiumPercent.toFixed(1)}%`
          )}
        </span>
        <div className="flex items-center gap-2">
          {priceSource && (
            <span className={`text-xs flex items-center gap-1 ${
              priceSource === 'ibja-estimate' ? 'text-blue-400' : 
              priceSource === 'api' ? 'text-green-400' : 'text-yellow-500'
            }`} title={
              priceSource === 'ibja-estimate' 
                ? `IBJA Rate + ${premiumApplied || 0}% platform premium` 
                : priceSource === 'api' 
                ? 'Price from official API' 
                : 'Price scraped from website'
            }>
              {priceSource === 'ibja-estimate' ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
              {priceSource === 'ibja-estimate' 
                ? `IBJA+${premiumApplied || 0}%` 
                : priceSource === 'api' 
                ? 'API' 
                : 'Live'}
            </span>
          )}
          <span className="text-xs text-zinc-500">{platform.displayName}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex gap-4">
          {product.imageUrl && (
            <div className="w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white line-clamp-2 text-sm">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
              <span>{product.weight}g</span>
              <span>•</span>
              <span>{product.purity}</span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-zinc-500">Total Price</p>
              <p className="text-xl font-bold text-white">
                ₹{price.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Per Gram</p>
              <p className={`text-lg font-semibold ${isBelowSpot ? 'text-green-400' : 'text-zinc-300'}`}>
                ₹{pricePerGram.toFixed(2)}
              </p>
            </div>
          </div>

          {isBelowSpot && savings > 0 && (
            <div className="mt-3 p-2 bg-green-500/10 rounded-lg">
              <p className="text-green-400 text-sm font-medium text-center">
                💰 Save ₹{savings.toFixed(0)} vs spot price
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${
              product.isAvailable ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-xs text-zinc-500">
              {product.isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <span className="flex items-center gap-1 text-gold-500 text-sm font-medium">
            Buy Now <ExternalLink size={14} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}
