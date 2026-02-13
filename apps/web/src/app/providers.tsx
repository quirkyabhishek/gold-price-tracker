'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30000,
            retry: 2,
          },
        },
      })
  );

  useEffect(() => {
    // Initialize socket only on client side
    const initSocket = async () => {
      const { initializeSocket } = await import('@/lib/socket');
      initializeSocket();
    };
    initSocket();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e1e1e',
            color: '#fff',
            border: '1px solid #333',
          },
        }}
      />
    </QueryClientProvider>
  );
}
