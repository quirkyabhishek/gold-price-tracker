'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Globe, Building2, Store, Check } from 'lucide-react';

interface JewellerRate {
  gold24k: number;
  gold24k995?: number;
  gold22k: number;
  gold18k?: number;
  silver?: number;
  source: string;
  timestamp: string;
}

interface KalyanRate {
  gold22k: number;       // Per gram
  gold22kPerGram: number; // Calculated per gram
  city: string;
  source: string;
  timestamp: string;
}

interface SpotPriceCardProps {
  spotPrices?: {
    international?: {
      priceINR: number;
      priceUSD: number;
      timestamp: string;
      source: string;
      note?: string;
    };
    ibja?: {
      gold999: number;
      gold995?: number;
      gold916: number;
      gold750?: number;
      rateType: string;
      timestamp: string;
    } | null;
    jewellers?: {
      png?: JewellerRate | null;
      bhima?: JewellerRate | null;
      ibja?: JewellerRate | null;
      kalyan?: KalyanRate | null;
    };
  };
  isConnected: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function SpotPriceCard({ spotPrices, isConnected, onRefresh, isRefreshing }: SpotPriceCardProps) {
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [localRefreshing, setLocalRefreshing] = useState(false);

  // Handle refresh click with local state for immediate feedback
  const handleRefresh = () => {
    if (onRefresh && !localRefreshing) {
      setLocalRefreshing(true);
      onRefresh();
      // Show "refreshing" for at least 1 second, then show "updated" for 2 seconds
      setTimeout(() => {
        setLocalRefreshing(false);
        setJustRefreshed(true);
        setTimeout(() => setJustRefreshed(false), 2000);
      }, 1000);
    }
  };

  // Also react to external isRefreshing prop
  useEffect(() => {
    if (isRefreshing && !localRefreshing) {
      setLocalRefreshing(true);
    }
    if (!isRefreshing && localRefreshing) {
      setLocalRefreshing(false);
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2000);
    }
  }, [isRefreshing, localRefreshing]);

  const showRefreshing = localRefreshing || isRefreshing;

  if (!spotPrices?.international) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded mb-4 w-1/4"></div>
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 h-32 bg-zinc-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const { international, ibja, jewellers } = spotPrices;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border relative overflow-hidden transition-all duration-300 ${
        justRefreshed 
          ? 'border-green-500/50 shadow-lg shadow-green-500/10' 
          : isRefreshing 
            ? 'border-gold-500/50' 
            : 'border-zinc-700'
      }`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${
        justRefreshed 
          ? 'bg-gradient-to-r from-green-500 via-green-300 to-green-500' 
          : 'bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500'
      }`} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="text-zinc-400 text-sm font-semibold">24K Gold Prices</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-zinc-500">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={showRefreshing}
          className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
            justRefreshed 
              ? 'bg-green-500/20 text-green-400' 
              : showRefreshing 
                ? 'bg-gold-500/20 text-gold-400'
                : 'hover:bg-zinc-700 text-zinc-400 hover:text-white'
          } disabled:cursor-not-allowed`}
          title="Refresh prices"
        >
          {justRefreshed ? (
            <>
              <Check className="w-5 h-5" />
              <span className="text-xs font-medium">Updated!</span>
            </>
          ) : showRefreshing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Refreshing...</span>
            </>
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Horizontal price cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* IBJA Rate */}
        {ibja && (
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-gold-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-gold-500" />
              <span className="text-xs text-gold-500 font-medium">IBJA</span>
            </div>
            <p className="text-2xl font-bold text-gold-400">₹{ibja.gold999.toLocaleString('en-IN')}</p>
            <p className="text-xs text-zinc-500">/g (24K)</p>
            <div className="mt-2 pt-2 border-t border-zinc-700 text-xs text-zinc-500">
              22K: ₹{ibja.gold916?.toLocaleString('en-IN')}/g
            </div>
          </div>
        )}

        {/* International Rate */}
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Yahoo Finance</span>
          </div>
          <p className="text-2xl font-bold text-white">₹{Math.round(international.priceINR).toLocaleString('en-IN')}</p>
          <p className="text-xs text-zinc-500">/g (24K)</p>
          <div className="mt-2 pt-2 border-t border-zinc-700 text-xs text-zinc-500">
            ${international.priceUSD.toFixed(2)}/g USD
          </div>
        </div>

        {/* PNG Rates */}
        {jewellers?.png && (
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">PNG</span>
            </div>
            <p className="text-2xl font-bold text-white">₹{jewellers.png.gold24k?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-zinc-500">/g (24K)</p>
            <div className="mt-2 pt-2 border-t border-zinc-700 text-xs text-zinc-500">
              22K: ₹{jewellers.png.gold22k?.toLocaleString('en-IN')}/g
            </div>
          </div>
        )}

        {/* Bhima Rates */}
        {jewellers?.bhima && (
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Bhima</span>
            </div>
            <p className="text-2xl font-bold text-white">₹{jewellers.bhima.gold24k?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-zinc-500">/g (24K)</p>
            <div className="mt-2 pt-2 border-t border-zinc-700 text-xs text-zinc-500">
              22K: ₹{jewellers.bhima.gold22k?.toLocaleString('en-IN')}/g
            </div>
          </div>
        )}

        {/* Kalyan Rates */}
        {jewellers?.kalyan && (
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-rose-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-rose-400 font-medium">Kalyan</span>
            </div>
            <p className="text-2xl font-bold text-white">₹{Math.round((jewellers.kalyan.gold22kPerGram / 22) * 24).toLocaleString('en-IN')}</p>
            <p className="text-xs text-zinc-500">/g (24K)*</p>
            <div className="mt-2 pt-2 border-t border-zinc-700 text-xs text-zinc-500">
              22K: ₹{jewellers.kalyan.gold22kPerGram?.toLocaleString('en-IN')}/g
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-zinc-600">*Kalyan 24K estimated from 22K rate</span>
        <span className={`transition-colors ${justRefreshed ? 'text-green-400 font-medium' : 'text-zinc-600'}`}>
          {justRefreshed && '✓ '}
          Updated: {new Date(ibja?.timestamp || international.timestamp).toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
          })}
        </span>
      </div>
    </motion.div>
  );
}
