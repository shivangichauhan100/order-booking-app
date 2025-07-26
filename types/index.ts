export interface OrderLevel {
  price: number;
  size: number;
  total: number;
}

export interface Orderbook {
  bids: OrderLevel[];
  asks: OrderLevel[];
  timestamp: number;
  symbol: string;
}

export interface Venue {
  id: string;
  name: string;
  wsUrl: string;
  restUrl: string;
  symbol: string;
}

export interface SimulatedOrder {
  id: string;
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  delay: number;
  timestamp: number;
  estimatedFill: number;
  marketImpact: number;
  slippage: number;
  timeToFill: number;
  position: {
    level: number;
    isHighlighted: boolean;
  };
}

export interface OrderbookState {
  venues: Record<string, Orderbook>;
  selectedVenue: string;
  simulatedOrders: SimulatedOrder[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: Record<string, 'connected' | 'connecting' | 'disconnected' | 'error'>;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  venue: string;
}

export interface OrderbookImbalance {
  ratio: number;
  direction: 'buy' | 'sell' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
} 