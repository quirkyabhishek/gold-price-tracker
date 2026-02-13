'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AlertWithTimestamp {
  id: string;
  type: 'ibja-vs-yahoo' | 'ibja-vs-png' | 'ibja-vs-bhima' | 'ibja-vs-kalyan';
  delta: number;
  comparison: string;
  ibjaPrice: number;
  otherPrice: number;
  timestamp: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertWithTimestamp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load alerts from localStorage
    try {
      const stored = localStorage.getItem('goldPriceAlerts');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAlerts(parsed);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
    setIsLoading(false);
  }, []);

  const handleClearAlerts = () => {
    if (window.confirm('Are you sure you want to clear all alerts?')) {
      setAlerts([]);
      try {
        localStorage.removeItem('goldPriceAlerts');
      } catch (error) {
        console.error('Failed to clear alerts:', error);
      }
    }
  };

  const getComparisonLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ibja-vs-yahoo': 'IBJA vs Yahoo Finance',
      'ibja-vs-png': 'IBJA vs PNG',
      'ibja-vs-bhima': 'IBJA vs Bhima',
      'ibja-vs-kalyan': 'IBJA vs Kalyan',
    };
    return labels[type] || type;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const getAlertColor = (delta: number) => {
    if (delta > 15) return 'border-red-500 bg-red-500/5';
    if (delta > 10) return 'border-orange-500 bg-orange-500/5';
    return 'border-amber-500 bg-amber-500/5';
  };

  const getAlertBadgeColor = (delta: number) => {
    if (delta > 15) return 'bg-red-500/20 text-red-400';
    if (delta > 10) return 'bg-orange-500/20 text-orange-400';
    return 'bg-amber-500/20 text-amber-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <RefreshCw className="w-8 h-8 text-gold-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-3xl font-bold">Price Variance Alerts</h1>
              <p className="text-zinc-400 mt-1">
                Historical log of price variance alerts (threshold: 8%)
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gold-500/20 text-gold-400 rounded-lg hover:bg-gold-500/30 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>

      {alerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center"
        >
          <AlertTriangle className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-300 mb-2">No Alerts Yet</h2>
          <p className="text-zinc-500 mb-6">
            When price variances exceed 8%, they'll appear here with timestamps.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-gold-500/20 text-gold-400 rounded-lg hover:bg-gold-500/30 transition-colors"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-between bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <span className="text-zinc-400">
              Total Alerts: <span className="font-bold text-white">{alerts.length}</span>
            </span>
            <button
              onClick={handleClearAlerts}
              className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg p-4 border-2 transition-all hover:shadow-lg ${getAlertColor(alert.delta)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          {getComparisonLabel(alert.type)}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Clock className="w-4 h-4" />
                          {formatTime(alert.timestamp)}
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${getAlertBadgeColor(alert.delta)}`}
                      >
                        {alert.delta.toFixed(2)}% diff
                      </div>
                    </div>

                    <div className="mt-3 bg-zinc-800/50 rounded p-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider">
                            IBJA Rate
                          </p>
                          <p className="text-lg font-bold text-gold-400 mt-1">
                            ₹{alert.ibjaPrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider">
                            {alert.comparison} Rate
                          </p>
                          <p className="text-lg font-bold text-white mt-1">
                            ₹{alert.otherPrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 mt-2">
                      {alert.otherPrice > alert.ibjaPrice
                        ? `${alert.comparison} is ₹${(alert.otherPrice - alert.ibjaPrice).toLocaleString('en-IN')} higher than IBJA`
                        : `${alert.comparison} is ₹${(alert.ibjaPrice - alert.otherPrice).toLocaleString('en-IN')} lower than IBJA`}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
