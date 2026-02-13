'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useMemo } from 'react';
import { api } from '@/lib/api';
import { SpotPriceCard } from '@/components/SpotPriceCard';
import { DealsList } from '@/components/DealsList';
import { PlatformGrid } from '@/components/PlatformGrid';
import { useSocketStore } from '@/stores/socketStore';
import { AlertBanner } from '@/components/AlertBanner';
import { PriceAlertBanner } from '@/components/PriceAlertBanner';
import { calculatePriceAlerts } from '@/lib/priceAlerts';
import { motion } from 'framer-motion';

export default function HomePage() {
  // Force refresh v2
  const { isConnected, realTimeDeals } = useSocketStore();
  const queryClient = useQueryClient();
  const forceRefreshRef = useRef(false);

  const { data: spotPrices, isFetching: isSpotPricesFetching } = useQuery({
    queryKey: ['spotPrice'],
    queryFn: async () => {
      const force = forceRefreshRef.current;
      forceRefreshRef.current = false;
      return api.get(`/prices/spot${force ? '?force=true' : ''}`).then((r) => r.data);
    },
    refetchInterval: 60000,
  });

  const handleRefreshSpotPrices = useCallback(() => {
    forceRefreshRef.current = true;
    queryClient.invalidateQueries({ queryKey: ['spotPrice'] });
  }, [queryClient]);

  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => api.get('/prices/deals').then((r) => r.data),
    refetchInterval: 30000,
  });

  // Extract deals array from response (API returns { deals: [...], spotPrices: ..., isDemo: ... })
  const deals = Array.isArray(dealsData?.deals) 
    ? dealsData.deals 
    : Array.isArray(dealsData) 
      ? dealsData 
      : [];

  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => api.get('/platforms').then((r) => r.data),
  });

  // Merge real-time deals with fetched deals
  const allDeals = [...(realTimeDeals || []), ...deals].reduce(
    (acc, deal) => {
      if (!acc.find((d: any) => d.product?.id === deal.product?.id)) {
        acc.push(deal);
      }
      return acc;
    },
    [] as any[]
  );

  // Get best deals (below spot)
  const bestDeals = allDeals
    .filter((d: any) => d.premiumPercent < 0)
    .sort((a: any, b: any) => a.premiumPercent - b.premiumPercent);
  
  // Get reference spot price for deals (prefer IBJA)
  const referenceSpotPrice = spotPrices?.ibja?.gold999 || spotPrices?.international?.priceINR;

  // Calculate price variance alerts
  const priceAlerts = useMemo(() => {
    return calculatePriceAlerts(spotPrices);
  }, [spotPrices]);

  return (
    <div className="space-y-8">
      {/* Price Variance Alert Banner */}
      {priceAlerts.length > 0 && (
        <PriceAlertBanner alerts={priceAlerts} />
      )}

      {bestDeals.length > 0 && (
        <AlertBanner deals={bestDeals} />
      )}

      {/* Spot Prices Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <SpotPriceCard 
          spotPrices={spotPrices} 
          isConnected={isConnected} 
          onRefresh={handleRefreshSpotPrices}
          isRefreshing={isSpotPricesFetching}
        />
      </motion.div>

      {/* Platforms Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            Platforms Monitored
          </h2>
          <PlatformGrid platforms={platforms || []} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🔥</span>
            Top 10 Deals
            {isConnected && (
              <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full animate-pulse">
                LIVE
              </span>
            )}
          </h2>
          <div className="text-sm text-zinc-500">
            Sorted by best discount
          </div>
        </div>

        <DealsList deals={allDeals} isLoading={dealsLoading} spotPrice={referenceSpotPrice} />
      </motion.div>
    </div>
  );
}
