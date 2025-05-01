export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  high: number;
  low: number;
  open: number;
  close: number;
  previousPrices?: number[];
  volume24h?: number;
  averageVolume?: number;
}

export interface AIPrediction {
  symbol: string;
  predictedPrice: number;
  confidence: number;
  timestamp: number;
  direction: 'up' | 'down';
  trend?: 'bullish' | 'bearish' | 'neutral';
  timeframe?: string;
  signals?: string[];
}

export interface MarketAnalysisResult {
  prediction: AIPrediction;
  riskScore: number;
  volatilityForecast: number;
  confidenceInterval: [number, number];
  technicalIndicators: Record<string, number>;
  sentimentAnalysis: {
    score: number;
    sources: string[];
  };
  recommendedAction?: 'buy' | 'sell' | 'hold';
  explanation: string;
}