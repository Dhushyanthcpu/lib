import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';

const API_KEY = '0fcc0912-6c4d-426d-bcda-bb2b7d0c6b48';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch market data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=7&interval=daily`,
      {
        headers: {
          'X-CG-API-KEY': API_KEY
        }
      }
    );
    const data = await response.json();

    // Process data and add AI predictions
    const processedData = data.prices.map((item: [number, number]) => ({
      timestamp: item[0],
      price: item[1],
      prediction: generateAIPrediction(item[1])
    }));

    // Add market sentiment analysis
    const sentiment = analyzeMarketSentiment(processedData);

    res.status(200).json({
      marketData: processedData,
      sentiment,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ message: 'Error fetching market data' });
  }
}

function generateAIPrediction(currentPrice: number): number {
  // Simulated AI prediction based on historical patterns
  const volatility = 0.1; // 10% volatility
  const trend = Math.random() > 0.5 ? 1 : -1; // Random trend
  return currentPrice * (1 + trend * volatility);
}

function analyzeMarketSentiment(data: any[]): string {
  // Simple sentiment analysis based on price movement
  const recentPrices = data.slice(-3);
  const priceChange = recentPrices[recentPrices.length - 1].price - recentPrices[0].price;
  const percentageChange = (priceChange / recentPrices[0].price) * 100;

  if (percentageChange > 5) return 'Bullish';
  if (percentageChange < -5) return 'Bearish';
  return 'Neutral';
} 