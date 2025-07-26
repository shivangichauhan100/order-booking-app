import { create } from 'zustand';
import { OrderbookState, Orderbook, SimulatedOrder, Venue } from '../types';

const VENUES: Record<string, Venue> = {
  okx: {
    id: 'okx',
    name: 'OKX',
    wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
    restUrl: 'https://www.okx.com/api/v5/market/books',
    symbol: 'BTC-USDT'
  },
  bybit: {
    id: 'bybit',
    name: 'Bybit',
    wsUrl: 'wss://stream.bybit.com/v5/public/spot',
    restUrl: 'https://api.bybit.com/v5/market/orderbook',
    symbol: 'BTCUSDT'
  },
  deribit: {
    id: 'deribit',
    name: 'Deribit',
    wsUrl: 'wss://www.deribit.com/ws/api/v2',
    restUrl: 'https://www.deribit.com/api/v2/public/get_order_book',
    symbol: 'BTC-PERPETUAL'
  }
};

interface OrderbookStore extends OrderbookState {
  // Actions
  setOrderbook: (venue: string, orderbook: Orderbook) => void;
  setSelectedVenue: (venue: string) => void;
  addSimulatedOrder: (order: SimulatedOrder) => void;
  removeSimulatedOrder: (orderId: string) => void;
  setConnectionStatus: (venue: string, status: OrderbookState['connectionStatus'][string]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getVenues: () => Record<string, Venue>;
  getSelectedVenue: () => Venue | null;
  calculateOrderbookImbalance: (venue: string) => { ratio: number; direction: 'buy' | 'sell' | 'neutral'; strength: 'weak' | 'moderate' | 'strong' };
}

export const useOrderbookStore = create<OrderbookStore>((set, get) => ({
  venues: {},
  selectedVenue: 'okx',
  simulatedOrders: [],
  isLoading: false,
  error: null,
  connectionStatus: {
    okx: 'disconnected',
    bybit: 'disconnected',
    deribit: 'disconnected'
  },

  setOrderbook: (venue, orderbook) =>
    set((state) => ({
      venues: {
        ...state.venues,
        [venue]: orderbook
      }
    })),

  setSelectedVenue: (venue) =>
    set({ selectedVenue: venue }),

  addSimulatedOrder: (order) =>
    set((state) => ({
      simulatedOrders: [...state.simulatedOrders, order]
    })),

  removeSimulatedOrder: (orderId) =>
    set((state) => ({
      simulatedOrders: state.simulatedOrders.filter(order => order.id !== orderId)
    })),

  setConnectionStatus: (venue, status) =>
    set((state) => ({
      connectionStatus: {
        ...state.connectionStatus,
        [venue]: status
      }
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  getVenues: () => VENUES,

  getSelectedVenue: () => {
    const state = get();
    return VENUES[state.selectedVenue] || null;
  },

  calculateOrderbookImbalance: (venue) => {
    const state = get();
    const orderbook = state.venues[venue];
    
    if (!orderbook || orderbook.bids.length === 0 || orderbook.asks.length === 0) {
      return { ratio: 0, direction: 'neutral', strength: 'weak' };
    }

    const totalBidSize = orderbook.bids.reduce((sum, bid) => sum + bid.size, 0);
    const totalAskSize = orderbook.asks.reduce((sum, ask) => sum + ask.size, 0);
    
    const ratio = totalBidSize / totalAskSize;
    
    let direction: 'buy' | 'sell' | 'neutral' = 'neutral';
    let strength: 'weak' | 'moderate' | 'strong' = 'weak';
    
    if (ratio > 1.1) {
      direction = 'buy';
      strength = ratio > 1.5 ? 'strong' : 'moderate';
    } else if (ratio < 0.9) {
      direction = 'sell';
      strength = ratio < 0.5 ? 'strong' : 'moderate';
    }
    
    return { ratio, direction, strength };
  }
})); 