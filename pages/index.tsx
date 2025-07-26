import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useOrderbookStore } from '../store/orderbookStore';

const Home: React.FC = () => {
  const router = useRouter();
  const { getVenues, setSelectedVenue } = useOrderbookStore();
  const venues = getVenues();

  const handleVenueSelect = (venueId: string) => {
    setSelectedVenue(venueId);
    router.push(`/${venueId}`);
  };

  return (
    <>
      <Head>
        <title>Crypto Orderbook Viewer</title>
        <meta name="description" content="Real-time cryptocurrency orderbook viewer for OKX, Bybit, and Deribit" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Crypto Orderbook Viewer
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real-time orderbook data from leading cryptocurrency exchanges with advanced order simulation capabilities
            </p>
          </div>

          {/* Venue Selection */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Select an Exchange
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(venues).map(([venueId, venue]) => (
                <div
                  key={venueId}
                  onClick={() => handleVenueSelect(venueId)}
                  className="bg-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-blue-200"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {venue.name.charAt(0)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {venue.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {venue.symbol}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex justify-between">
                        <span>Symbol:</span>
                        <span className="font-medium">{venue.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">
                          {venueId === 'deribit' ? 'Perpetual' : 'Spot'}
                        </span>
                      </div>
                    </div>
                    
                    <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200">
                      View Orderbook
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="max-w-6xl mx-auto mt-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Real-time Data</h3>
                <p className="text-gray-600 text-sm">
                  Live WebSocket connections to get instant orderbook updates
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Depth Charts</h3>
                <p className="text-gray-600 text-sm">
                  Visual market depth analysis with interactive charts
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Simulation</h3>
                <p className="text-gray-600 text-sm">
                  Test order strategies with fill analysis and market impact
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Mobile Responsive</h3>
                <p className="text-gray-600 text-sm">
                  Optimized for all devices with touch-friendly interface
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-gray-500">
            <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
            <p className="mt-2">
              Data provided by OKX, Bybit, and Deribit APIs
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home; 