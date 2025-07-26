import { Orderbook, SimulatedOrder, OrderLevel } from '../types';

export const calculateOrderPosition = (
  orderbook: Orderbook,
  order: Omit<SimulatedOrder, 'id' | 'timestamp' | 'estimatedFill' | 'marketImpact' | 'slippage' | 'timeToFill' | 'position'>
): { level: number; isHighlighted: boolean } => {
  const { side, price, type } = order;
  
  if (type === 'market') {
    return { level: -1, isHighlighted: true }; // Market orders execute immediately
  }
  
  if (side === 'buy') {
    // Find position in asks (buying from sellers)
    const askIndex = orderbook.asks.findIndex(ask => ask.price >= price);
    return {
      level: askIndex >= 0 ? askIndex : orderbook.asks.length,
      isHighlighted: askIndex >= 0 && orderbook.asks[askIndex].price === price
    };
  } else {
    // Find position in bids (selling to buyers)
    const bidIndex = orderbook.bids.findIndex(bid => bid.price <= price);
    return {
      level: bidIndex >= 0 ? bidIndex : orderbook.bids.length,
      isHighlighted: bidIndex >= 0 && orderbook.bids[bidIndex].price === price
    };
  }
};

export const calculateEstimatedFill = (
  orderbook: Orderbook,
  order: Omit<SimulatedOrder, 'id' | 'timestamp' | 'estimatedFill' | 'marketImpact' | 'slippage' | 'timeToFill' | 'position'>
): number => {
  const { side, price, quantity, type } = order;
  
  if (type === 'market') {
    return 100; // Market orders are assumed to fill 100%
  }
  
  let remainingQuantity = quantity;
  let filledQuantity = 0;
  
  if (side === 'buy') {
    // Check how much we can buy at or better than our limit price
    for (const ask of orderbook.asks) {
      if (ask.price <= price && remainingQuantity > 0) {
        const fillAmount = Math.min(remainingQuantity, ask.size);
        filledQuantity += fillAmount;
        remainingQuantity -= fillAmount;
      } else if (ask.price > price) {
        break;
      }
    }
  } else {
    // Check how much we can sell at or better than our limit price
    for (const bid of orderbook.bids) {
      if (bid.price >= price && remainingQuantity > 0) {
        const fillAmount = Math.min(remainingQuantity, bid.size);
        filledQuantity += fillAmount;
        remainingQuantity -= fillAmount;
      } else if (bid.price < price) {
        break;
      }
    }
  }
  
  return (filledQuantity / quantity) * 100;
};

export const calculateMarketImpact = (
  orderbook: Orderbook,
  order: Omit<SimulatedOrder, 'id' | 'timestamp' | 'estimatedFill' | 'marketImpact' | 'slippage' | 'timeToFill' | 'position'>
): number => {
  const { side, quantity, type } = order;
  
  if (type === 'limit') {
    return 0; // Limit orders have minimal market impact
  }
  
  // Calculate average price impact
  let totalCost = 0;
  let remainingQuantity = quantity;
  
  if (side === 'buy') {
    for (const ask of orderbook.asks) {
      if (remainingQuantity > 0) {
        const fillAmount = Math.min(remainingQuantity, ask.size);
        totalCost += fillAmount * ask.price;
        remainingQuantity -= fillAmount;
      } else {
        break;
      }
    }
  } else {
    for (const bid of orderbook.bids) {
      if (remainingQuantity > 0) {
        const fillAmount = Math.min(remainingQuantity, bid.size);
        totalCost += fillAmount * bid.price;
        remainingQuantity -= fillAmount;
      } else {
        break;
      }
    }
  }
  
  const averagePrice = totalCost / quantity;
  const bestPrice = side === 'buy' ? orderbook.asks[0]?.price : orderbook.bids[0]?.price;
  
  if (!bestPrice) return 0;
  
  return ((averagePrice - bestPrice) / bestPrice) * 100;
};

export const calculateSlippage = (
  orderbook: Orderbook,
  order: Omit<SimulatedOrder, 'id' | 'timestamp' | 'estimatedFill' | 'marketImpact' | 'slippage' | 'timeToFill' | 'position'>
): number => {
  const { side, price, type } = order;
  
  if (type === 'limit') {
    return 0; // Limit orders execute at specified price
  }
  
  const bestPrice = side === 'buy' ? orderbook.asks[0]?.price : orderbook.bids[0]?.price;
  
  if (!bestPrice) return 0;
  
  return ((price - bestPrice) / bestPrice) * 100;
};

export const calculateTimeToFill = (
  orderbook: Orderbook,
  order: Omit<SimulatedOrder, 'id' | 'timestamp' | 'estimatedFill' | 'marketImpact' | 'slippage' | 'timeToFill' | 'position'>,
  delay: number
): number => {
  const { type } = order;
  
  if (type === 'market') {
    return delay; // Market orders execute after delay
  }
  
  // Estimate time based on position in orderbook and fill percentage
  const baseTime = delay;
  const estimatedFill = calculateEstimatedFill(orderbook, order);
  const positionPenalty = estimatedFill < 100 ? 30 : 0; // Additional time if partial fill
  const marketActivity = Math.random() * 10; // Random market activity factor
  
  return baseTime + positionPenalty + marketActivity;
};

export const generateSimulatedOrder = (
  orderbook: Orderbook,
  orderData: {
    type: 'limit' | 'market';
    side: 'buy' | 'sell';
    price: number;
    quantity: number;
    delay: number;
  }
): SimulatedOrder => {
  const { type, side, price, quantity, delay } = orderData;
  
  const estimatedFill = calculateEstimatedFill(orderbook, { type, side, price, quantity, delay });
  const marketImpact = calculateMarketImpact(orderbook, { type, side, price, quantity, delay });
  const slippage = calculateSlippage(orderbook, { type, side, price, quantity, delay });
  const timeToFill = calculateTimeToFill(orderbook, { type, side, price, quantity, delay }, delay);
  const position = calculateOrderPosition(orderbook, { type, side, price, quantity, delay });
  
  return {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    side,
    price,
    quantity,
    delay,
    timestamp: Date.now(),
    estimatedFill,
    marketImpact,
    slippage,
    timeToFill,
    position
  };
}; 