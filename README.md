# Crypto Orderbook Viewer

A real-time cryptocurrency orderbook viewer web application built with Next.js, TypeScript, and Tailwind CSS. The app integrates WebSocket connections from three major crypto exchanges — OKX, Bybit, and Deribit — to display live orderbook data with advanced order simulation capabilities.

## Features

### 🚀 Real-time Data
- Live WebSocket connections to OKX, Bybit, and Deribit
- 15 levels of bids and asks per venue
- Automatic reconnection with fallback to REST API
- Real-time orderbook updates

### 📊 Advanced Visualization
- Responsive orderbook tables with color-coded bids/asks
- Interactive market depth charts using Recharts
- Orderbook imbalance indicators
- Spread analysis and market statistics

### 🎯 Order Simulation
- Limit and market order simulation
- Buy/sell side selection
- Configurable delay timing (immediate, 5s, 10s, 30s)
- Real-time fill percentage calculation
- Market impact and slippage analysis
- Time to fill estimation
- Visual order positioning in orderbook

### 📱 User Experience
- Mobile-responsive design
- Intuitive navigation between venues
- Connection status indicators
- Error handling with user-friendly messages
- Clean, modern UI with Tailwind CSS

### 🔧 Technical Features
- TypeScript for type safety
- Zustand for state management
- Efficient WebSocket handling with cleanup
- Error handling and fallback mechanisms
- Modular component architecture

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **WebSocket**: Native WebSocket API
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-orderbook-viewer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Home Page
- Select from available exchanges (OKX, Bybit, Deribit)
- View exchange information and trading pairs
- Navigate to specific venue orderbooks

### Orderbook View
- **Real-time Data**: Live orderbook updates with connection status
- **Orderbook Table**: Side-by-side display of bids and asks with cumulative totals
- **Depth Chart**: Interactive market depth visualization (toggle on/off)
- **Market Info**: Current best bid/ask, spread, and spread percentage
- **Order Simulation**: Test order strategies with detailed analysis

### Order Simulation
1. Click "Simulate Order" to open the order form
2. Select order type (Limit/Market)
3. Choose side (Buy/Sell)
4. Enter price and quantity
5. Select delay timing
6. Submit to see order analysis

### Features
- **Fill Analysis**: Estimated fill percentage based on current orderbook
- **Market Impact**: Calculated price impact of the order
- **Slippage**: Expected slippage for market orders
- **Time to Fill**: Estimated execution time
- **Visual Positioning**: Highlighted order position in orderbook

## Project Structure

```
├── components/          # React components
│   ├── OrderbookTable.tsx
│   ├── OrderForm.tsx
│   └── DepthChart.tsx
├── hooks/              # Custom React hooks
│   ├── useWebSocket.ts
│   └── useOrderbook.ts
├── store/              # State management
│   └── orderbookStore.ts
├── utils/              # Utility functions
│   ├── apiAdapters.ts
│   └── orderSimUtils.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── pages/              # Next.js pages
│   ├── index.tsx
│   └── [venue].tsx
└── styles/             # Global styles
    └── globals.css
```

## API Integration

### Supported Exchanges

#### OKX
- **WebSocket**: `wss://ws.okx.com:8443/ws/v5/public`
- **REST**: `https://www.okx.com/api/v5/market/books`
- **Symbol**: BTC-USDT

#### Bybit
- **WebSocket**: `wss://stream.bybit.com/v5/public/spot`
- **REST**: `https://api.bybit.com/v5/market/orderbook`
- **Symbol**: BTCUSDT

#### Deribit
- **WebSocket**: `wss://www.deribit.com/ws/api/v2`
- **REST**: `https://www.deribit.com/api/v2/public/get_order_book`
- **Symbol**: BTC-PERPETUAL

### WebSocket Message Format

Each exchange uses different message formats:

- **OKX**: JSON with `op` and `args` fields
- **Bybit**: JSON with `op` and `args` fields
- **Deribit**: JSON with `method` and `params` fields

## Configuration

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_WS_RECONNECT_INTERVAL=5000
NEXT_PUBLIC_MAX_ORDERBOOK_LEVELS=15
```

### Customization

- **Venues**: Add new exchanges in `store/orderbookStore.ts`
- **Styling**: Modify Tailwind classes or extend theme in `tailwind.config.js`
- **Charts**: Customize chart appearance in `components/DepthChart.tsx`

## Error Handling

The application includes comprehensive error handling:

- **WebSocket Failures**: Automatic reconnection with exponential backoff
- **API Errors**: Fallback to REST API when WebSocket fails
- **Data Parsing**: Graceful handling of malformed responses
- **User Feedback**: Clear error messages and status indicators

## Performance Considerations

- **WebSocket Management**: Proper cleanup and reconnection logic
- **State Updates**: Efficient updates using Zustand
- **Component Optimization**: React.memo for expensive components
- **Data Processing**: Efficient orderbook calculations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This application is for educational and demonstration purposes only. It does not provide financial advice or trading recommendations. Always do your own research and consider consulting with a financial advisor before making investment decisions.

## Support

For issues and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS 