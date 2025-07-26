import { useMemo } from 'react';
import { useOrderbookStore } from '../store/orderbookStore';
import { Orderbook, OrderbookImbalance } from '../types';
import { calculateCumulativeTotals } from '../utils/apiAdapters';

export const useOrderbook = (venue: string) => {
  const { venues, connectionStatus } = useOrderbookStore();
  
  const orderbook = venues[venue];
  const isConnected = connectionStatus[venue] === 'connected';
  
  const orderbookWithTotals = useMemo(() => {
    if (!orderbook) return null;
    return calculateCumulativeTotals(orderbook);
  }, [orderbook]);
  
  const spread = useMemo(() => {
    if (!orderbookWithTotals || !orderbookWithTotals.asks.length || !orderbookWithTotals.bids.length) {
      return { absolute: 0, percentage: 0 };
    }
    
    const bestAsk = orderbookWithTotals.asks[0].price;
    const bestBid = orderbookWithTotals.bids[0].price;
    const absolute = bestAsk - bestBid;
    const percentage = (absolute / bestAsk) * 100;
    
    return { absolute, percentage };
  }, [orderbookWithTotals]);
  
  const imbalance = useMemo((): OrderbookImbalance => {
    if (!orderbookWithTotals || !orderbookWithTotals.asks.length || !orderbookWithTotals.bids.length) {
      return { ratio: 0, direction: 'neutral', strength: 'weak' };
    }
    
    const totalBidSize = orderbookWithTotals.bids.reduce((sum, bid) => sum + bid.size, 0);
    const totalAskSize = orderbookWithTotals.asks.reduce((sum, ask) => sum + ask.size, 0);
    
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
  }, [orderbookWithTotals]);
  
  const midPrice = useMemo(() => {
    if (!orderbookWithTotals || !orderbookWithTotals.asks.length || !orderbookWithTotals.bids.length) {
      return 0;
    }
    
    const bestAsk = orderbookWithTotals.asks[0].price;
    const bestBid = orderbookWithTotals.bids[0].price;
    return (bestAsk + bestBid) / 2;
  }, [orderbookWithTotals]);
  
  const totalVolume = useMemo(() => {
    if (!orderbookWithTotals) return { bids: 0, asks: 0, total: 0 };
    
    const bidVolume = orderbookWithTotals.bids.reduce((sum, bid) => sum + bid.size, 0);
    const askVolume = orderbookWithTotals.asks.reduce((sum, ask) => sum + ask.size, 0);
    
    return {
      bids: bidVolume,
      asks: askVolume,
      total: bidVolume + askVolume
    };
  }, [orderbookWithTotals]);
  
  return {
    orderbook,
    orderbookWithTotals,
    isConnected,
    spread,
    imbalance,
    midPrice,
    totalVolume,
    isLoading: !orderbook && connectionStatus[venue] === 'connecting'
  };
}; 