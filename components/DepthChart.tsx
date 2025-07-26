import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOrderbookStore } from '../store/orderbookStore';
import { calculateCumulativeTotals } from '../utils/apiAdapters';

interface DepthChartProps {
  venue: string;
}

const DepthChart: React.FC<DepthChartProps> = ({ venue }) => {
  const { venues } = useOrderbookStore();
  const orderbook = venues[venue];

  if (!orderbook) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-gray-500">No data available for depth chart</div>
      </div>
    );
  }

  const orderbookWithTotals = calculateCumulativeTotals(orderbook);
  
  // Prepare data for the chart
  const chartData = [
    // Asks (reversed for proper visualization)
    ...orderbookWithTotals.asks.slice().reverse().map((ask, index) => ({
      price: ask.price,
      askTotal: ask.total,
      bidTotal: 0,
      type: 'ask'
    })),
    // Bids
    ...orderbookWithTotals.bids.map((bid, index) => ({
      price: bid.price,
      askTotal: 0,
      bidTotal: bid.total,
      type: 'bid'
    }))
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">Price: ${label?.toFixed(2)}</p>
          {data.askTotal > 0 && (
            <p className="text-red-600">Ask Total: {data.askTotal.toFixed(4)}</p>
          )}
          {data.bidTotal > 0 && (
            <p className="text-green-600">Bid Total: {data.bidTotal.toFixed(4)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatSize = (value: number) => {
    return value.toFixed(4);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Market Depth - {venue.toUpperCase()}
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-red-600">Asks</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-600">Bids</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="price" 
              tickFormatter={formatPrice}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={formatSize}
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="askTotal"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="bidTotal"
              stackId="2"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Market Statistics */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-red-50 rounded-md">
          <h4 className="font-medium text-red-800 mb-1">Total Ask Volume</h4>
          <p className="text-red-600">
            {orderbookWithTotals.asks.reduce((sum, ask) => sum + ask.size, 0).toFixed(4)}
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-md">
          <h4 className="font-medium text-green-800 mb-1">Total Bid Volume</h4>
          <p className="text-green-600">
            {orderbookWithTotals.bids.reduce((sum, bid) => sum + bid.size, 0).toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepthChart; 