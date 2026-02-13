import { useCallback, useRef, useState, useEffect } from 'react';

export interface AlertWithTimestamp {
  id: string;
  type: 'ibja-vs-yahoo' | 'ibja-vs-png' | 'ibja-vs-bhima' | 'ibja-vs-kalyan';
  delta: number;
  comparison: string;
  ibjaPrice: number;
  otherPrice: number;
  timestamp: Date;
}

const MAX_ALERTS = 50; // Keep last 50 alerts

export function useAlertHistory() {
  const [alerts, setAlerts] = useState<AlertWithTimestamp[]>([]);
  const alertsRef = useRef<AlertWithTimestamp[]>([]);

  const addAlert = useCallback((alert: Omit<AlertWithTimestamp, 'id' | 'timestamp'>) => {
    const newAlert: AlertWithTimestamp = {
      ...alert,
      id: `${alert.type}-${Date.now()}`,
      timestamp: new Date(),
    };

    alertsRef.current = [newAlert, ...alertsRef.current].slice(0, MAX_ALERTS);
    setAlerts([...alertsRef.current]);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        const serialized = alertsRef.current.map((a) => ({
          ...a,
          timestamp: a.timestamp.toISOString(),
        }));
        localStorage.setItem('goldPriceAlerts', JSON.stringify(serialized));
      } catch (error) {
        console.error('Failed to persist alerts to localStorage:', error);
      }
    }
  }, []);

  // Load alerts from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('goldPriceAlerts');
        if (stored) {
          const parsed = JSON.parse(stored).map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp),
          }));
          alertsRef.current = parsed;
          setAlerts(parsed);
        }
      } catch (error) {
        console.error('Failed to load alerts from localStorage:', error);
      }
    }
  }, []);

  const clearAlerts = useCallback(() => {
    alertsRef.current = [];
    setAlerts([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('goldPriceAlerts');
      } catch (error) {
        console.error('Failed to clear alerts from localStorage:', error);
      }
    }
  }, []);

  return { alerts, addAlert, clearAlerts };
}
