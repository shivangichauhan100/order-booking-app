import React, { useState } from 'react';
import { useOrderbookStore } from '../store/orderbookStore';
import { generateSimulatedOrder } from '../utils/orderSimUtils';

interface OrderFormData {
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  delay: number;
}

const OrderForm: React.FC = () => {
  const { venues, selectedVenue, addSimulatedOrder } = useOrderbookStore();
  const orderbook = venues[selectedVenue];
  
  const [formData, setFormData] = useState<OrderFormData>({
    type: 'limit',
    side: 'buy',
    price: 0,
    quantity: 0,
    delay: 0
  });

  // Fix: errors should be Partial<Record<keyof OrderFormData, string>>
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OrderFormData, string>> = {};

    if (formData.price <= 0 && formData.type === 'limit') {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (formData.delay < 0) {
      newErrors.delay = 'Delay must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !orderbook) {
      return;
    }

    const simulatedOrder = generateSimulatedOrder(orderbook, formData);
    addSimulatedOrder(simulatedOrder);

    // Reset form
    setFormData({
      type: 'limit',
      side: 'buy',
      price: 0,
      quantity: 0,
      delay: 0
    });
    setErrors({});
  };

  const handleInputChange = (field: keyof OrderFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const getCurrentPrice = () => {
    if (!orderbook) return 0;
    
    if (formData.side === 'buy') {
      return orderbook.asks[0]?.price || 0;
    } else {
      return orderbook.bids[0]?.price || 0;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Order Simulation
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="limit"
                checked={formData.type === 'limit'}
                onChange={(e) => handleInputChange('type', e.target.value as 'limit' | 'market')}
                className="mr-2"
              />
              <span className="text-sm">Limit</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="market"
                checked={formData.type === 'market'}
                onChange={(e) => handleInputChange('type', e.target.value as 'limit' | 'market')}
                className="mr-2"
              />
              <span className="text-sm">Market</span>
            </label>
          </div>
        </div>

        {/* Order Side */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Side
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="side"
                value="buy"
                checked={formData.side === 'buy'}
                onChange={(e) => handleInputChange('side', e.target.value as 'buy' | 'sell')}
                className="mr-2"
              />
              <span className="text-sm text-green-600 font-medium">Buy</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="side"
                value="sell"
                checked={formData.side === 'sell'}
                onChange={(e) => handleInputChange('side', e.target.value as 'buy' | 'sell')}
                className="mr-2"
              />
              <span className="text-sm text-red-600 font-medium">Sell</span>
            </label>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price {formData.type === 'market' && '(Market Price)'}
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              disabled={formData.type === 'market'}
              className={`flex-1 px-3 py-2 border rounded-md ${
                errors.price 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } ${formData.type === 'market' ? 'bg-gray-100' : ''}`}
              placeholder={formData.type === 'market' ? 'Market Price' : 'Enter price'}
            />
            {formData.type === 'limit' && (
              <button
                type="button"
                onClick={() => handleInputChange('price', getCurrentPrice())}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Current
              </button>
            )}
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            step="0.0001"
            value={formData.quantity || ''}
            onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.quantity 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="Enter quantity"
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>

        {/* Delay */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delay (seconds)
          </label>
          <select
            value={formData.delay}
            onChange={(e) => handleInputChange('delay', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={0}>Immediate</option>
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={30}>30 seconds</option>
          </select>
          {errors.delay && (
            <p className="mt-1 text-sm text-red-600">{errors.delay}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!orderbook}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Simulate Order
        </button>
      </form>

      {/* Current Market Info */}
      {orderbook && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Market</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Best Ask:</span>
              <span className="ml-2 text-red-600 font-medium">
                {(typeof orderbook.asks[0]?.price === 'number' ? orderbook.asks[0].price.toFixed(2) : 'N/A')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Best Bid:</span>
              <span className="ml-2 text-green-600 font-medium">
                {(typeof orderbook.bids[0]?.price === 'number' ? orderbook.bids[0].price.toFixed(2) : 'N/A')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm; 