import { create } from 'zustand';

interface Deal {
  product: {
    id: string;
    name: string;
    weight: number;
    productUrl: string;
  };
  platform: {
    id: string;
    name: string;
    displayName: string;
  };
  price: number;
  pricePerGram: number;
  premiumPercent: number;
  spotPrice: number;
}

interface SocketState {
  isConnected: boolean;
  realTimeDeals: Deal[];
  
  setConnected: (connected: boolean) => void;
  addDeal: (deal: Deal) => void;
  clearDeals: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  isConnected: false,
  realTimeDeals: [],
  
  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },
  
  addDeal: (deal: Deal) => {
    set((state) => {
      const existingIndex = state.realTimeDeals.findIndex(
        (d) => d.product.id === deal.product.id
      );
      
      let newDeals = [...state.realTimeDeals];
      
      if (existingIndex >= 0) {
        newDeals[existingIndex] = deal;
      } else {
        newDeals = [deal, ...newDeals].slice(0, 100);
      }
      
      return { realTimeDeals: newDeals };
    });
  },
  
  clearDeals: () => {
    set({ realTimeDeals: [] });
  },
}));
