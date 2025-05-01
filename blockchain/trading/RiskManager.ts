import { Position, TradeSignal } from './AutomatedTradingManager';
import { MarketData } from '../types/market';

export class RiskManager {
  private maxPositionSize: number;
  private maxDrawdown: number;
  private stopLossPercent: number;
  private takeProfitRatio: number;
  private positions: Map<string, Position>;
  private portfolioValue: number;

  constructor(
    maxPositionSize: number = 0.1, // 10% of portfolio
    maxDrawdown: number = 0.2, // 20% max drawdown
    stopLossPercent: number = 0.02, // 2% stop loss
    takeProfitRatio: number = 2.0 // 2:1 reward/risk ratio
  ) {
    this.maxPositionSize = maxPositionSize;
    this.maxDrawdown = maxDrawdown;
    this.stopLossPercent = stopLossPercent;
    this.takeProfitRatio = takeProfitRatio;
    this.positions = new Map();
    this.portfolioValue = 0;
  }

  public setPortfolioValue(value: number): void {
    this.portfolioValue = value;
  }

  public validateSignal(signal: TradeSignal, marketData: MarketData): boolean {
    // Check if we have enough portfolio value for the trade
    const positionSize = this.calculatePositionSize(marketData.close);
    if (positionSize <= 0) return false;

    // Check current exposure
    const totalExposure = this.calculateTotalExposure();
    if (totalExposure + positionSize > this.portfolioValue * this.maxPositionSize) {
      return false;
    }

    // Check drawdown
    const currentDrawdown = this.calculateDrawdown();
    if (currentDrawdown > this.maxDrawdown) {
      return false;
    }

    return true;
  }

  public calculateStopLoss(entryPrice: number, direction: 'long' | 'short'): number {
    return direction === 'long'
      ? entryPrice * (1 - this.stopLossPercent)
      : entryPrice * (1 + this.stopLossPercent);
  }

  public calculateTakeProfit(entryPrice: number, direction: 'long' | 'short'): number {
    const stopLossDistance = entryPrice * this.stopLossPercent;
    return direction === 'long'
      ? entryPrice + (stopLossDistance * this.takeProfitRatio)
      : entryPrice - (stopLossDistance * this.takeProfitRatio);
  }

  private calculatePositionSize(price: number): number {
    const riskAmount = this.portfolioValue * this.stopLossPercent;
    return Math.min(
      (this.portfolioValue * this.maxPositionSize),
      riskAmount / (price * this.stopLossPercent)
    );
  }

  private calculateTotalExposure(): number {
    return Array.from(this.positions.values())
      .reduce((total, pos) => total + Math.abs(pos.size * pos.entryPrice), 0);
  }

  private calculateDrawdown(): number {
    const totalPnL = Array.from(this.positions.values())
      .reduce((total, pos) => {
        const pnl = pos.unrealizedPnL || 0;
        return total + pnl;
      }, 0);
    
    return Math.abs(totalPnL) / this.portfolioValue;
  }
} 