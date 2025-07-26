import { useEffect, useRef, useCallback } from 'react';
import { useOrderbookStore } from '../store/orderbookStore';
import { WebSocketMessage, Orderbook } from '../types';

export const useWebSocket = (venue: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { 
    getVenues, 
    setOrderbook, 
    setConnectionStatus, 
    setError 
  } = useOrderbookStore();

  const venues = getVenues();
  const venueConfig = venues[venue];

  const connect = useCallback(() => {
    if (!venueConfig) return;

    setConnectionStatus(venue, 'connecting');
    
    try {
      const ws = new WebSocket(venueConfig.wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus(venue, 'connected');
        setError(null);
        
        // Subscribe to orderbook updates based on venue
        const subscribeMessage = getSubscribeMessage(venue, venueConfig.symbol);
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Debug logging for Deribit
          if (venue === 'deribit') {
            console.log('Deribit WebSocket message:', data);
          }
          
          const orderbook = parseOrderbookData(venue, data);
          if (orderbook) {
            setOrderbook(venue, orderbook);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setConnectionStatus(venue, 'disconnected');
        scheduleReconnect();
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${venue}:`, error);
        setConnectionStatus(venue, 'error');
        setError(`Connection error for ${venue}`);
      };

    } catch (error) {
      console.error(`Failed to connect to ${venue}:`, error);
      setConnectionStatus(venue, 'error');
      setError(`Failed to connect to ${venue}`);
    }
  }, [venue, venueConfig, setOrderbook, setConnectionStatus, setError]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionStatus(venue, 'disconnected');
  }, [venue, setConnectionStatus]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 5000); // Reconnect after 5 seconds
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { connect, disconnect };
};

const getSubscribeMessage = (venue: string, symbol: string) => {
  switch (venue) {
    case 'okx':
      return {
        op: 'subscribe',
        args: [{
          channel: 'books',
          instId: symbol
        }]
      };
    case 'bybit':
      return {
        op: 'subscribe',
        args: [`orderbook.1.${symbol}`]
      };
    case 'deribit':
      return {
        method: 'public/subscribe',
        params: {
          channels: [`book.${symbol}.100ms`]
        }
      };
    default:
      return {};
  }
};

const parseOrderbookData = (venue: string, data: any): Orderbook | null => {
  try {
    switch (venue) {
      case 'okx':
        if (data.event === 'subscribe' || !data.data) return null;
        const okxData = data.data[0];
        return {
          bids: okxData.bids.map((bid: [string, string, string]) => ({
            price: parseFloat(bid[0]),
            size: parseFloat(bid[1]),
            total: 0
          })).slice(0, 15),
          asks: okxData.asks.map((ask: [string, string, string]) => ({
            price: parseFloat(ask[0]),
            size: parseFloat(ask[1]),
            total: 0
          })).slice(0, 15),
          timestamp: Date.now(),
          symbol: okxData.instId
        };

      case 'bybit':
        if (data.topic?.includes('orderbook') && data.data) {
          const bybitData = data.data;
          return {
            bids: bybitData.b.map((bid: [string, string]) => ({
              price: parseFloat(bid[0]),
              size: parseFloat(bid[1]),
              total: 0
            })).slice(0, 15),
            asks: bybitData.a.map((ask: [string, string]) => ({
              price: parseFloat(ask[0]),
              size: parseFloat(ask[1]),
              total: 0
            })).slice(0, 15),
            timestamp: Date.now(),
            symbol: bybitData.s
          };
        }
        return null;

      case 'deribit':
        if (data.method === 'subscription' && data.params?.data) {
          const deribitData = data.params.data;
          
          // Validate that we have the required data
          if (!deribitData.bids || !deribitData.asks || !Array.isArray(deribitData.bids) || !Array.isArray(deribitData.asks)) {
            console.warn('Invalid Deribit orderbook data structure:', deribitData);
            return null;
          }
          
          return {
            bids: deribitData.bids
              .filter((bid: any) => Array.isArray(bid) && bid.length >= 2 && typeof bid[0] === 'number' && typeof bid[1] === 'number')
              .map((bid: [number, number]) => ({
                price: bid[0],
                size: bid[1],
                total: 0
              }))
              .slice(0, 15),
            asks: deribitData.asks
              .filter((ask: any) => Array.isArray(ask) && ask.length >= 2 && typeof ask[0] === 'number' && typeof ask[1] === 'number')
              .map((ask: [number, number]) => ({
                price: ask[0],
                size: ask[1],
                total: 0
              }))
              .slice(0, 15),
            timestamp: Date.now(),
            symbol: deribitData.instrument_name || 'BTC-PERPETUAL'
          };
        }
        return null;

      default:
        return null;
    }
  } catch (error) {
    console.error(`Error parsing ${venue} orderbook data:`, error);
    return null;
  }
}; 