import React from 'react';
import { useOrderbookStore } from '../store/orderbookStore';
import { OrderLevel, SimulatedOrder } from '../types';
import { calculateCumulativeTotals } from '../utils/apiAdapters';

interface OrderbookTableProps {
  venue: string;
  simulatedOrders: SimulatedOrder[];
}

const OrderbookTable: React.FC<OrderbookTableProps> = ({ venue, simulatedOrders }) => {
  const { venues, selectedVenue } = useOrderbookStore();
  const orderbook = venues[venue];
  
  if (!orderbook) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-gray-500">No orderbook data available</div>
      </div>
    );
  }

  const orderbookWithTotals = calculateCumulativeTotals(orderbook);
  const maxTotal = Math.max(
    ...orderbookWithTotals.bids.map(bid => bid.total),
    ...orderbookWithTotals.asks.map(ask => ask.total)
  );

  const isHighlighted = (price: number, side: 'buy' | 'sell') => {
    return simulatedOrders.some(order => 
      order.price === price && order.side === side
    );
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatSize = (size: number) => {
    if (typeof size !== 'number' || isNaN(size)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(size);
  };

  const formatTotal = (total: number) => {
    if (typeof total !== 'number' || isNaN(total)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(total);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          {venue.toUpperCase()} Orderbook
        </h3>
        <p className="text-sm text-gray-500">
          {orderbook.symbol} • Last updated: {new Date(orderbook.timestamp).toLocaleTimeString()}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-0">
        {/* Asks (Sell Orders) */}
        <div className="bg-red-50">
          <div className="px-4 py-2 bg-red-100 border-b border-red-200">
            <h4 className="text-sm font-medium text-red-800">Asks (Sell)</h4>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-red-50">
                <tr className="text-xs text-red-700">
                  <th className="px-2 py-1 text-left">Price</th>
                  <th className="px-2 py-1 text-right">Size</th>
                  <th className="px-2 py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderbookWithTotals.asks.slice().reverse().map((ask, index) => (
                  <tr
                    key={`ask-${index}`}
                    className={`text-sm border-b border-red-100 ${
                      isHighlighted(ask.price, 'sell') 
                        ? 'bg-yellow-100 border-yellow-300' 
                        : 'hover:bg-red-50'
                    }`}
                  >
                    <td className="px-2 py-1 text-red-600 font-medium">
                      {formatPrice(ask.price)}
                    </td>
                    <td className="px-2 py-1 text-right text-gray-700">
                      {formatSize(ask.size)}
                    </td>
                    <td className="px-2 py-1 text-right text-gray-700 relative">
                      {formatTotal(ask.total)}
                      <div 
                        className="absolute top-0 left-0 h-full bg-red-200 opacity-30"
                        style={{ width: `${(ask.total / maxTotal) * 100}%` }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="bg-green-50">
          <div className="px-4 py-2 bg-green-100 border-b border-green-200">
            <h4 className="text-sm font-medium text-green-800">Bids (Buy)</h4>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-green-50">
                <tr className="text-xs text-green-700">
                  <th className="px-2 py-1 text-left">Price</th>
                  <th className="px-2 py-1 text-right">Size</th>
                  <th className="px-2 py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderbookWithTotals.bids.map((bid, index) => (
                  <tr
                    key={`bid-${index}`}
                    className={`text-sm border-b border-green-100 ${
                      isHighlighted(bid.price, 'buy') 
                        ? 'bg-yellow-100 border-yellow-300' 
                        : 'hover:bg-green-50'
                    }`}
                  >
                    <td className="px-2 py-1 text-green-600 font-medium">
                      {formatPrice(bid.price)}
                    </td>
                    <td className="px-2 py-1 text-right text-gray-700">
                      {formatSize(bid.size)}
                    </td>
                    <td className="px-2 py-1 text-right text-gray-700 relative">
                      {formatTotal(bid.total)}
                      <div 
                        className="absolute top-0 left-0 h-full bg-green-200 opacity-30"
                        style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Spread Information */}
      {orderbookWithTotals.asks.length > 0 && orderbookWithTotals.bids.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Spread: {formatPrice(orderbookWithTotals.asks[0].price - orderbookWithTotals.bids[0].price)}
            </span>
            <span className="text-gray-600">
              Spread %: {((orderbookWithTotals.asks[0].price - orderbookWithTotals.bids[0].price) / orderbookWithTotals.asks[0].price * 100).toFixed(4)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderbookTable; 