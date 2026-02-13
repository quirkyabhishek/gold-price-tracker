import { io, Socket } from 'socket.io-client';
import { useSocketStore } from '@/stores/socketStore';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function initializeSocket() {
  if (socket?.connected) return;
  if (typeof window === 'undefined') return;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  const { setConnected, addDeal } = useSocketStore.getState();

  socket.on('connect', () => {
    console.log('Socket connected');
    setConnected(true);
    socket?.emit('subscribe:prices');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
    setConnected(false);
  });

  socket.on('deals', (deals: any[]) => {
    console.log('Received deals:', deals.length);
    deals.forEach((deal) => {
      addDeal(deal);
      
      // Show toast for deals below spot
      if (deal.premiumPercent < 0) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
            max-w-md w-full bg-zinc-900 border border-gold-500 shadow-lg rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🪙</span>
              <div className="flex-1">
                <p className="font-semibold text-gold-500">Deal Alert!</p>
                <p className="text-sm text-zinc-300">
                  {deal.product.name} - {Math.abs(deal.premiumPercent).toFixed(1)}% below spot
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {deal.platform.displayName}
                </p>
              </div>
              <a
                href={deal.product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gold-500 text-black text-sm font-semibold rounded hover:bg-gold-400"
              >
                Buy
              </a>
            </div>
          </div>
        ), { duration: 10000 });
      }
    });
  });

  socket.on('error', (error: any) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
