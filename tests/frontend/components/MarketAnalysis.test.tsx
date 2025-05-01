import React from 'react';
import { render, screen } from '@testing-library/react';
import { MarketAnalysis } from '../../../components/MarketAnalysis';

// Mock the CryptoMarketAnalyzer
jest.mock('../../../blockchain/market/CryptoMarketAnalyzer', () => {
  return {
    CryptoMarketAnalyzer: {
      getInstance: jest.fn().mockReturnValue({
        getAllMarketData: jest.fn().mockReturnValue([
          {
            symbol: 'BTC',
            price: 50000,
            volume24h: 30000000000,
            change24h: 5.2,
            marketCap: 950000000000,
            lastUpdate: new Date()
          },
          {
            symbol: 'ETH',
            price: 3000,
            volume24h: 15000000000,
            change24h: -2.1,
            marketCap: 350000000000,
            lastUpdate: new Date()
          }
        ]),
        getAllPredictions: jest.fn().mockReturnValue([
          {
            symbol: 'BTC',
            predictedPrice: 52000,
            confidence: 0.85,
            trend: 'bullish',
            timeframe: '24h',
            signals: ['Strong upward momentum']
          },
          {
            symbol: 'ETH',
            predictedPrice: 2900,
            confidence: 0.75,
            trend: 'bearish',
            timeframe: '24h',
            signals: ['Strong downward pressure']
          }
        ]),
        on: jest.fn(),
        removeListener: jest.fn()
      })
    }
  };
});

describe('MarketAnalysis Component', () => {
  it('renders the component title', () => {
    render(<MarketAnalysis />);
    expect(screen.getByText('Crypto Market Analysis')).toBeInTheDocument();
  });

  it('displays market data for cryptocurrencies', () => {
    render(<MarketAnalysis />);
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
  });

  it('shows the timeframe selector', () => {
    render(<MarketAnalysis />);
    expect(screen.getByText('1H')).toBeInTheDocument();
    expect(screen.getByText('24H')).toBeInTheDocument();
    expect(screen.getByText('7D')).toBeInTheDocument();
  });

  it('displays the quantum AI predictions section', () => {
    render(<MarketAnalysis />);
    expect(screen.getByText('Quantum AI Predictions')).toBeInTheDocument();
  });
});