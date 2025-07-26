import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useOrderbookStore } from '../store/orderbookStore';
import { useWebSocket } from '../hooks/useWebSocket';
import OrderbookTable from '../components/OrderbookTable';
import OrderForm from '../components/OrderForm';
import DepthChart from '../components/DepthChart';

const VenuePage: React.FC = () => {
  const router = useRouter();
  const { venue } = router.query;
  const venueId = venue as string;
  
  const { 
    venues, 
    selectedVenue, 
    setSelectedVenue, 
    simulatedOrders,
    connectionStatus,
    error,
    clearError,
    calculateOrderbookImbalance,
    getVenues
  } = useOrderbookStore();

  const [showDepthChart, setShowDepthChart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Initialize WebSocket connection
  useWebSocket(venueId);

  useEffect(() => {
    if (venueId && venues[venueId]) {
      setSelectedVenue(venueId);
    }
  }, [venueId, venues, setSelectedVenue]);

  // Fix: get venue config from getVenues()
  const venueConfig = getVenues()[venueId];
  const orderbook = venues[venueId];
  const imbalance = calculateOrderbookImbalance(venueId);

  if (!venueConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Venue Not Found</h1>
          <p className="text-gray-600 mb-4">The requested exchange is not available.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImbalanceColor = (direction: string) => {
    switch (direction) {
      case 'buy': return 'text-green-600';
      case 'sell': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <Head>
        <title>{venueConfig.name} Orderbook - Crypto Orderbook Viewer</title>
        <meta name="description" content={`Real-time ${venueConfig.name} orderbook data`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{venueConfig.name}</h1>
                  <p className="text-sm text-gray-600">{venueConfig.symbol}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus[venueId] === 'connected' ? 'bg-green-500' :
                    connectionStatus[venueId] === 'connecting' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className={`text-sm ${getConnectionStatusColor(connectionStatus[venueId])}`}>
                    {connectionStatus[venueId]}
                  </span>
                </div>
                
                {orderbook && (
                  <div className="text-sm text-gray-600">
                    Last update: {new Date(orderbook.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-b border-red-200">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800">{error}</span>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orderbook and Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowDepthChart(!showDepthChart)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      showDepthChart 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showDepthChart ? 'Hide' : 'Show'} Depth Chart
                  </button>
                  
                  {orderbook && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">Imbalance:</span>
                      <span className={`font-medium ${getImbalanceColor(imbalance.direction)}`}>
                        {imbalance.direction.toUpperCase()} ({imbalance.strength})
                      </span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowOrderForm(!showOrderForm)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    showOrderForm 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {showOrderForm ? 'Hide' : 'Simulate Order'}
                </button>
              </div>

              {/* Orderbook Table */}
              <OrderbookTable venue={venueId} simulatedOrders={simulatedOrders} />

              {/* Depth Chart */}
              {showDepthChart && (
                <DepthChart venue={venueId} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Form */}
              {showOrderForm && (
                <OrderForm />
              )}

              {/* Simulated Orders */}
              {simulatedOrders.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Simulated Orders
                  </h3>
                  
                  <div className="space-y-3">
                    {simulatedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 border rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${
                            order.side === 'buy' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {order.side.toUpperCase()} {order.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <span className="ml-1 font-medium">${order.price.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Qty:</span>
                            <span className="ml-1 font-medium">{order.quantity.toFixed(4)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Fill:</span>
                            <span className="ml-1 font-medium">{order.estimatedFill.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Impact:</span>
                            <span className="ml-1 font-medium">{order.marketImpact.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Info */}
              {orderbook && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Market Info
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Best Ask:</span>
                      <span className="text-red-600 font-medium">
                        ${(typeof orderbook.asks[0]?.price === 'number' ? orderbook.asks[0].price.toFixed(2) : 'N/A')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Best Bid:</span>
                      <span className="text-green-600 font-medium">
                        ${(typeof orderbook.bids[0]?.price === 'number' ? orderbook.bids[0].price.toFixed(2) : 'N/A')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Spread:</span>
                      <span className="font-medium">
                        ${(typeof orderbook.asks[0]?.price === 'number' && typeof orderbook.bids[0]?.price === 'number' 
                          ? (orderbook.asks[0].price - orderbook.bids[0].price).toFixed(2) 
                          : 'N/A')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Spread %:</span>
                      <span className="font-medium">
                        {(typeof orderbook.asks[0]?.price === 'number' && typeof orderbook.bids[0]?.price === 'number')
                          ? ((orderbook.asks[0].price - orderbook.bids[0].price) / orderbook.asks[0].price * 100).toFixed(4)
                          : 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default VenuePage; 