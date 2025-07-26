import axios from 'axios';
import { Orderbook, Venue } from '../types';

export const fetchOrderbookRest = async (venue: string, symbol: string): Promise<Orderbook | null> => {
  try {
    let response;
    
    switch (venue) {
      case 'okx':
        response = await axios.get(`https://www.okx.com/api/v5/market/books`, {
          params: { instId: symbol, sz: '15' }
        });
        if (response.data.code === '0' && response.data.data) {
          const data = response.data.data[0];
          return {
            bids: data.bids.map((bid: [string, string, string]) => ({
              price: parseFloat(bid[0]),
              size: parseFloat(bid[1]),
              total: 0
            })),
            asks: data.asks.map((ask: [string, string, string]) => ({
              price: parseFloat(ask[0]),
              size: parseFloat(ask[1]),
              total: 0
            })),
            timestamp: Date.now(),
            symbol: data.instId
          };
        }
        break;

      case 'bybit':
        response = await axios.get(`https://api.bybit.com/v5/market/orderbook`, {
          params: { category: 'spot', symbol, limit: 15 }
        });
        if (response.data.retCode === 0 && response.data.result) {
          const data = response.data.result;
          return {
            bids: data.b.map((bid: [string, string]) => ({
              price: parseFloat(bid[0]),
              size: parseFloat(bid[1]),
              total: 0
            })),
            asks: data.a.map((ask: [string, string]) => ({
              price: parseFloat(ask[0]),
              size: parseFloat(ask[1]),
              total: 0
            })),
            timestamp: Date.now(),
            symbol: data.s
          };
        }
        break;

      case 'deribit':
        response = await axios.get(`https://www.deribit.com/api/v2/public/get_order_book`, {
          params: { instrument_name: symbol, depth: 15 }
        });
        if (response.data.result) {
          const data = response.data.result;
          return {
            bids: data.bids.map((bid: [number, number]) => ({
              price: bid[0],
              size: bid[1],
              total: 0
            })),
            asks: data.asks.map((ask: [number, number]) => ({
              price: ask[0],
              size: ask[1],
              total: 0
            })),
            timestamp: Date.now(),
            symbol: data.instrument_name
          };
        }
        break;

      default:
        return null;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching ${venue} orderbook via REST:`, error);
    return null;
  }
};

export const calculateCumulativeTotals = (orderbook: Orderbook): Orderbook => {
  let bidTotal = 0;
  let askTotal = 0;
  
  const bidsWithTotals = orderbook.bids.map(bid => {
    bidTotal += bid.size;
    return { ...bid, total: bidTotal };
  });
  
  const asksWithTotals = orderbook.asks.map(ask => {
    askTotal += ask.size;
    return { ...ask, total: askTotal };
  });
  
  return {
    ...orderbook,
    bids: bidsWithTotals,
    asks: asksWithTotals
  };
}; 