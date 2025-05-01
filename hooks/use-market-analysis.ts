import { useState, useEffect } from 'react';
import { CryptoMarketAnalyzer } from '../lib/blockchain/market/CryptoMarketAnalyzer';

interface MarketAnalysis {
  topPerformers: any[];
  predictions: any[];
  trends: {
    shortTerm: string;
    midTerm: string;
    longTerm: string;
    confidence: number;
  };
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  volatilityIndex: number;
  recommendedActions: string[];
}

export function useMarketAnalysis(symbols?: string[]) {
  const [analysis, setAnalysis] = useState<MarketAnalysis>({
    topPerformers: [],
    predictions: [],
    trends: {
      shortTerm: 'neutral',
      midTerm: 'neutral',
      longTerm: 'neutral',
      confidence: 0
    },
    marketSentiment: 'neutral',
    volatilityIndex: 0,
    recommendedActions: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzer = CryptoMarketAnalyzer.getInstance();

    const updateAnalysis = () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get market data
        const marketData = symbols 
          ? symbols.map(s => analyzer.getMarketData(s)).filter(Boolean)
          : analyzer.getAllMarketData();

        // Get predictions
        const predictions = symbols
          ? symbols.map(s => analyzer.getPrediction(s)).filter(Boolean)
          : analyzer.getAllPredictions();

        // Calculate market sentiment
        const avgChange = marketData.reduce((sum, data) => sum + data.change24h, 0) / marketData.length;
        const marketSentiment: 'bullish' | 'bearish' | 'neutral' = 
          avgChange > 2 ? 'bullish' : avgChange < -2 ? 'bearish' : 'neutral';

        // Calculate volatility index
        const changes = marketData.map(data => Math.abs(data.change24h));
        const volatilityIndex = changes.reduce((sum, change) => sum + change, 0) / changes.length;

        // Generate recommended actions
        const recommendedActions = generateRecommendations(marketSentiment, volatilityIndex, predictions);

        setAnalysis({
          topPerformers: analyzer.getTopPerformers(),
          predictions: predictions,
          trends: {
            shortTerm: calculateTrend(predictions, '1h'),
            midTerm: calculateTrend(predictions, '24h'),
            longTerm: calculateTrend(predictions, '7d'),
            confidence: calculateConfidence(predictions)
          },
          marketSentiment,
          volatilityIndex,
          recommendedActions
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while analyzing market data');
      } finally {
        setIsLoading(false);
      }
    };

    // Subscribe to updates
    analyzer.on('marketDataUpdated', updateAnalysis);
    analyzer.on('predictionUpdated', updateAnalysis);

    // Initial analysis
    updateAnalysis();

    return () => {
      analyzer.removeListener('marketDataUpdated', updateAnalysis);
      analyzer.removeListener('predictionUpdated', updateAnalysis);
    };
  }, [symbols]);

  return { analysis, isLoading, error };
}

function calculateTrend(predictions: any[], timeframe: '1h' | '24h' | '7d'): string {
  const relevantPredictions = predictions.filter(p => p.timeframe === timeframe);
  const bullishCount = relevantPredictions.filter(p => p.trend === 'bullish').length;
  const bearishCount = relevantPredictions.filter(p => p.trend === 'bearish').length;

  if (bullishCount > bearishCount) return 'bullish';
  if (bearishCount > bullishCount) return 'bearish';
  return 'neutral';
}

function calculateConfidence(predictions: any[]): number {
  if (predictions.length === 0) return 0;
  return predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
}

function generateRecommendations(
  sentiment: 'bullish' | 'bearish' | 'neutral',
  volatility: number,
  predictions: any[]
): string[] {
  const recommendations: string[] = [];

  // Market sentiment based recommendations
  if (sentiment === 'bullish') {
    recommendations.push('Consider increasing positions in top performing assets');
    if (volatility > 5) {
      recommendations.push('Use dollar-cost averaging to manage high volatility');
    }
  } else if (sentiment === 'bearish') {
    recommendations.push('Consider defensive positions');
    recommendations.push('Set stop-loss orders to protect positions');
  }

  // Volatility based recommendations
  if (volatility > 10) {
    recommendations.push('High market volatility - exercise caution');
    recommendations.push('Consider reducing position sizes');
  } else if (volatility < 3) {
    recommendations.push('Low volatility period - watch for breakout opportunities');
  }

  // Prediction based recommendations
  const highConfidencePredictions = predictions.filter(p => p.confidence > 0.8);
  if (highConfidencePredictions.length > 0) {
    recommendations.push(`Strong signals detected for: ${highConfidencePredictions.map(p => p.symbol).join(', ')}`);
  }

  return recommendations;
} 