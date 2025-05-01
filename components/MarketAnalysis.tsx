import React, { useEffect, useState } from 'react';
import { CryptoMarketAnalyzer } from '../blockchain/market/CryptoMarketAnalyzer';

interface MarketDataDisplay {
  symbol: string;
  price: string;
  change24h: string;
  trend: string;
  prediction: string;
  confidence: string;
}

export function MarketAnalysis() {
  const [marketData, setMarketData] = useState<MarketDataDisplay[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d'>('24h');
  const [topPerformers, setTopPerformers] = useState<MarketDataDisplay[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const analyzer = CryptoMarketAnalyzer.getInstance();

    const updateDisplayData = () => {
      const allData = analyzer.getAllMarketData();
      const allPredictions = analyzer.getAllPredictions();

      const displayData = allData.map(data => {
        const prediction = allPredictions.find(p => p.symbol === data.symbol);
        return {
          symbol: data.symbol,
          price: `$${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
          change24h: `${data.change24h.toFixed(2)}%`,
          trend: prediction?.trend || 'neutral',
          prediction: prediction ? `$${prediction.predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : 'N/A',
          confidence: prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : 'N/A'
        };
      });

      setMarketData(displayData);
      setTopPerformers(displayData.sort((a, b) => 
        parseFloat(b.change24h) - parseFloat(a.change24h)
      ).slice(0, 5));

      // Update chart data
      const chartPoints = allData.slice(0, 10).map(data => ({
        name: data.symbol,
        price: data.price,
        predicted: analyzer.getPrediction(data.symbol)?.predictedPrice || data.price
      }));
      setChartData(chartPoints);
    };

    // Subscribe to updates
    analyzer.on('marketDataUpdated', updateDisplayData);
    analyzer.on('predictionUpdated', updateDisplayData);

    // Initial update
    updateDisplayData();

    return () => {
      analyzer.removeListener('marketDataUpdated', updateDisplayData);
      analyzer.removeListener('predictionUpdated', updateDisplayData);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Crypto Market Analysis</h2>
      
      <div className="mb-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                selectedTimeframe === '1h'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTimeframe('1h')}
            >
              1H
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                selectedTimeframe === '24h'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTimeframe('24h')}
            >
              24H
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                selectedTimeframe === '7d'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTimeframe('7d')}
            >
              7D
            </button>
          </nav>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPerformers.map(coin => (
            <div key={coin.symbol} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-bold">{coin.symbol}</span>
                <span className={`${parseFloat(coin.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {coin.change24h}
                </span>
              </div>
              <div className="mt-2">
                <div>Price: {coin.price}</div>
                <div>Predicted: {coin.prediction}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Market Trends</h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <div className="grid gap-4">
            {marketData.slice(0, 8).map(coin => (
              <div key={coin.symbol} className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                <div>
                  <span className="font-bold">{coin.symbol}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">{coin.price}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`${
                    coin.trend === 'bullish' 
                      ? 'text-green-500' 
                      : coin.trend === 'bearish' 
                        ? 'text-red-500' 
                        : 'text-gray-500'
                  }`}>
                    {coin.trend.toUpperCase()}
                  </span>
                  <span className="text-sm">Confidence: {coin.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Quantum AI Predictions</h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <p className="mb-4">Our quantum-enhanced AI predicts the following market movements:</p>
          <div className="space-y-2">
            {marketData.slice(0, 3).map(coin => (
              <div key={coin.symbol} className="p-2 border border-gray-200 dark:border-gray-600 rounded-md">
                <div className="flex justify-between">
                  <span className="font-bold">{coin.symbol}</span>
                  <span className="font-medium">Current: {coin.price}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Prediction (24h)</span>
                  <span className={`font-medium ${
                    parseFloat(coin.prediction.replace('$', '')) > parseFloat(coin.price.replace('$', ''))
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                    {coin.prediction}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 