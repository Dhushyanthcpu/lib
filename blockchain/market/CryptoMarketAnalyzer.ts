import { EventEmitter } from 'events';
import axios from 'axios';
import { FidelityMLWorkflow } from '../ai/FidelityMLWorkflow';

interface MarketData {
  symbol: string;
  price: number;
  volume24h: number;
  change24h: number;
  marketCap: number;
  lastUpdate: Date;
}

interface AIPrediction {
  symbol: string;
  predictedPrice: number;
  confidence: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  timeframe: '1h' | '24h' | '7d';
  signals: string[];
}

export class CryptoMarketAnalyzer extends EventEmitter {
  private static instance: CryptoMarketAnalyzer;
  private readonly API_KEY = '0fcc0912-6c4d-426d-bcda-bb2b7d0c6b48';
  private readonly API_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';
  private marketData: Map<string, MarketData>;
  private predictions: Map<string, AIPrediction>;
  private updateInterval: NodeJS.Timeout | null;
  private fidelityMLWorkflow: FidelityMLWorkflow;

  private constructor() {
    super();
    this.marketData = new Map();
    this.predictions = new Map();
    this.updateInterval = null;
    this.fidelityMLWorkflow = new FidelityMLWorkflow();
    this.startRealTimeUpdates();
  }

  static getInstance(): CryptoMarketAnalyzer {
    if (!CryptoMarketAnalyzer.instance) {
      CryptoMarketAnalyzer.instance = new CryptoMarketAnalyzer();
    }
    return CryptoMarketAnalyzer.instance;
  }

  private async startRealTimeUpdates(): Promise<void> {
    // Initial update
    await this.updateMarketData();
    await this.generateAIPredictions();

    // Set up periodic updates
    this.updateInterval = setInterval(async () => {
      await this.updateMarketData();
      await this.generateAIPredictions();
    }, 60000); // Update every minute
  }

  private async updateMarketData(): Promise<void> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/cryptocurrency/listings/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.API_KEY
        },
        params: {
          limit: 100,
          convert: 'USD'
        }
      });

      const { data } = response.data;
      
      data.forEach((coin: any) => {
        const marketData: MarketData = {
          symbol: coin.symbol,
          price: coin.quote.USD.price,
          volume24h: coin.quote.USD.volume_24h,
          change24h: coin.quote.USD.percent_change_24h,
          marketCap: coin.quote.USD.market_cap,
          lastUpdate: new Date()
        };

        this.marketData.set(coin.symbol, marketData);
      });

      this.emit('marketDataUpdated', Array.from(this.marketData.values()));
    } catch (error) {
      console.error('Error updating market data:', error);
      this.emit('error', error);
    }
  }

  private async generateAIPredictions(): Promise<void> {
    for (const [symbol, data] of this.marketData) {
      try {
        // Generate AI prediction using market data
        const prediction = await this.analyzeTrends(symbol, data);
        this.predictions.set(symbol, prediction);
        this.emit('predictionUpdated', { symbol, prediction });
      } catch (error) {
        console.error(`Error generating prediction for ${symbol}:`, error);
      }
    }
  }

  private async analyzeTrends(symbol: string, data: MarketData): Promise<AIPrediction> {
    try {
      // Convert market data to the format expected by FidelityMLWorkflow
      const marketDataForML = {
        symbol: data.symbol,
        price: data.price,
        volume: data.volume24h,
        timestamp: data.lastUpdate.getTime(),
        high: data.price * (1 + Math.max(0, data.change24h / 200)), // Estimate high
        low: data.price * (1 - Math.max(0, -data.change24h / 200)), // Estimate low
        open: data.price / (1 + (data.change24h / 100)), // Estimate open price based on 24h change
        close: data.price,
        volume24h: data.volume24h,
        averageVolume: data.volume24h * 0.9, // Estimate average volume
        previousPrices: [
          data.price / (1 + (data.change24h / 100)), // Estimate previous price
          data.price / (1 + (data.change24h / 100)) * 0.99, // More previous prices
          data.price / (1 + (data.change24h / 100)) * 0.98
        ]
      };
      
      // Ingest data into the Fidelity ML Workflow
      await this.fidelityMLWorkflow.ingestData(marketDataForML);
      
      // Generate prediction using Fidelity ML Workflow
      const fidelityResult = await this.fidelityMLWorkflow.generatePrediction(symbol);
      
      // Extract signals from the Fidelity ML result
      const signals = fidelityResult.featureImportance ? 
        Object.entries(fidelityResult.featureImportance)
          .filter(([_, value]) => value > 0.1)
          .map(([key, value]) => `${key.replace(/_/g, ' ')} (impact: ${(value * 100).toFixed(1)}%)`) : 
        [];
        
      // Add traditional signals as well
      if (data.volume24h > data.marketCap * 0.1) {
        signals.push('High trading volume detected');
      }
      
      if (data.change24h > 5) {
        signals.push('Strong upward momentum');
      } else if (data.change24h < -5) {
        signals.push('Strong downward pressure');
      }
      
      // Map the trend from Fidelity result
      let trend: 'bullish' | 'bearish' | 'neutral';
      if (fidelityResult.prediction.trend) {
        trend = fidelityResult.prediction.trend;
      } else {
        // Fallback to traditional trend analysis
        if (data.change24h > 5) {
          trend = 'bullish';
        } else if (data.change24h < -5) {
          trend = 'bearish';
        } else {
          trend = 'neutral';
        }
      }
      
      return {
        symbol,
        predictedPrice: fidelityResult.prediction.predictedPrice,
        confidence: fidelityResult.prediction.confidence,
        trend,
        timeframe: '24h',
        signals
      };
    } catch (error) {
      console.error(`Error using Fidelity ML Workflow for ${symbol}:`, error);
      
      // Fallback to traditional analysis if Fidelity ML fails
      const signals: string[] = [];
      let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  
      // Volume analysis
      if (data.volume24h > data.marketCap * 0.1) {
        signals.push('High trading volume detected');
      }
  
      // Price movement analysis
      if (data.change24h > 5) {
        trend = 'bullish';
        signals.push('Strong upward momentum');
      } else if (data.change24h < -5) {
        trend = 'bearish';
        signals.push('Strong downward pressure');
      }
  
      // Calculate predicted price using simple ML model
      const predictedPrice = data.price * (1 + (data.change24h / 100));
      const confidence = Math.min(Math.abs(data.change24h) / 10, 0.9);
  
      return {
        symbol,
        predictedPrice,
        confidence,
        trend,
        timeframe: '24h',
        signals
      };
    }
  }

  public getMarketData(symbol: string): MarketData | undefined {
    return this.marketData.get(symbol);
  }

  public getPrediction(symbol: string): AIPrediction | undefined {
    return this.predictions.get(symbol);
  }

  public getAllMarketData(): MarketData[] {
    return Array.from(this.marketData.values());
  }

  public getAllPredictions(): AIPrediction[] {
    return Array.from(this.predictions.values());
  }

  public getTopPerformers(limit: number = 5): MarketData[] {
    return Array.from(this.marketData.values())
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, limit);
  }

  public getTopPredictions(limit: number = 5): AIPrediction[] {
    return Array.from(this.predictions.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
} 