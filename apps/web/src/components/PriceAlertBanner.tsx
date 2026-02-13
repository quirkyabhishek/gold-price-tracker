'use client';

import { AlertTriangle, TrendingUp, History } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';

interface PriceAlert {
  type: 'ibja-vs-yahoo' | 'ibja-vs-png' | 'ibja-vs-bhima' | 'ibja-vs-kalyan';
  delta: number;
  comparison: string;
  ibjaPrice: number;
  otherPrice: number;
}

interface PriceAlertBannerProps {
  alerts: PriceAlert[];
  onAlertsChange?: () => void;
}

export function PriceAlertBanner({ alerts, onAlertsChange }: PriceAlertBannerProps) {
  // Persist alerts to localStorage whenever they change
  useEffect(() => {
    if (alerts.length > 0) {
      try {
        const alertsWithTimestamp = alerts.map((alert) => ({
          ...alert,
          id: `${alert.type}-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
        }));

        // Get existing alerts
        const existing = localStorage.getItem('goldPriceAlerts');
        let allAlerts = existing ? JSON.parse(existing) : [];

        // Add new alerts (avoid duplicates within same second)
        const newAlerts = alertsWithTimestamp.filter((newAlert) => {
          return !allAlerts.some(
            (existing: any) =>
              existing.type === newAlert.type &&
              existing.delta.toFixed(2) === newAlert.delta.toFixed(2)
          );
        });

        if (newAlerts.length > 0) {
          allAlerts = [...newAlerts, ...allAlerts].slice(0, 50); // Keep last 50
          localStorage.setItem('goldPriceAlerts', JSON.stringify(allAlerts));
          onAlertsChange?.();
        }
      } catch (error) {
        console.error('Failed to persist alerts:', error);
      }
    }
  }, [alerts, onAlertsChange]);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getComparisonLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ibja-vs-yahoo': 'IBJA vs Yahoo Finance',
      'ibja-vs-png': 'IBJA vs PNG',
      'ibja-vs-bhima': 'IBJA vs Bhima',
      'ibja-vs-kalyan': 'IBJA vs Kalyan',
    };
    return labels[type] || type;
  };

  const isHighDelta = alerts.some((alert) => alert.delta > 15);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg p-4 border-2 mb-6 ${
        isHighDelta
          ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
          : 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle
            className={`w-5 h-5 ${isHighDelta ? 'text-red-500' : 'text-amber-500'}`}
          />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold mb-3 ${isHighDelta ? 'text-red-400' : 'text-amber-400'}`}>
            ⚠️ Price Variance Alert
          </h3>
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`text-sm p-2 rounded-md ${
                  isHighDelta ? 'bg-red-500/20' : 'bg-amber-500/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="font-medium text-zinc-200">
                    {getComparisonLabel(alert.type)}
                  </span>
                  <span className={`ml-auto font-bold ${
                    alert.delta > 15 ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {alert.delta.toFixed(2)}% difference
                  </span>
                </div>
                <div className="text-xs text-zinc-400 ml-6">
                  IBJA: ₹{alert.ibjaPrice.toLocaleString('en-IN')} vs {alert.comparison}: ₹{alert.otherPrice.toLocaleString('en-IN')}
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
            {isHighDelta
              ? '🔴 High variance detected! Significant price differences may present opportunities or risks.'
              : '🟡 Moderate variance detected. Consider checking multiple sources before purchasing.'}
          </p>
          <div className="mt-4">
            <Link
              href="/alerts"
              className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-700/50 hover:bg-zinc-700 rounded text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <History className="w-4 h-4" />
              View Alert History
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
