export interface MarketData {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
}

export interface AIPrediction {
    symbol: string;
    predictedPrice: number;
    confidence: number;
    timestamp: number;
} 