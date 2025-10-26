import { gasTracker } from '../envio/gas-tracker';
import { portfolioAnalytics } from '../envio/portfolio-analytics';

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  factors: RiskFactor[];
  recommendation: string;
}

export interface RiskFactor {
  type: string;
  severity: number;
  description: string;
}

export class RiskAssessor {
  async assessAction(action: any, context: any): Promise<RiskAssessment> {
    if (!action || typeof action !== 'object') {
      throw new Error('Invalid action');
    }
    
    if (!context || typeof context !== 'object') {
      throw new Error('Invalid context');
    }
    
    const factors: RiskFactor[] = [];
    
    try {
      if (typeof action.chain === 'number') {
        const gasRisk = await this.assessGasRisk(action.chain);
        if (gasRisk) factors.push(gasRisk);
      }
    } catch (error) {
      console.error('Gas risk assessment failed');
    }
    
    try {
      if (typeof action.amount === 'number' && typeof context.portfolioValue === 'number') {
        const amountRisk = this.assessAmountRisk(action.amount, context.portfolioValue);
        if (amountRisk) factors.push(amountRisk);
      }
    } catch (error) {
      console.error('Amount risk assessment failed');
    }
    
    try {
      if (typeof action.chain === 'number') {
        const chainRisk = this.assessChainRisk(action.chain);
        if (chainRisk) factors.push(chainRisk);
      }
    } catch (error) {
      console.error('Chain risk assessment failed');
    }
    
    try {
      if (typeof context.address === 'string') {
        const concentrationRisk = await this.assessConcentrationRisk(action, context.address);
        if (concentrationRisk) factors.push(concentrationRisk);
      }
    } catch (error) {
      console.error('Concentration risk assessment failed');
    }
    
    const score = this.calculateRiskScore(factors);
    const level = this.getRiskLevel(score);
    
    return {
      level,
      score,
      factors,
      recommendation: this.getRecommendation(level, factors)
    };
  }
  
  private async assessGasRisk(chain: number): Promise<RiskFactor | null> {
    try {
      const gasPrices = await gasTracker.getGasPrices();
      const gasPrice = gasPrices[chain];
      
      if (typeof gasPrice !== 'number') {
        return null;
      }
      
      if (gasPrice > 100) {
        return {
          type: 'gas',
          severity: 0.7,
          description: `High gas price: ${gasPrice} gwei`
        };
      }
      
      return null;
    } catch (error) {
      console.error('Gas risk assessment failed:', error);
      return null;
    }
  }
  
  private assessAmountRisk(amount: number, portfolioValue: number): RiskFactor | null {
    const percentage = (amount / portfolioValue) * 100;
    
    if (percentage > 50) {
      return {
        type: 'amount',
        severity: 0.9,
        description: `Large transaction: ${percentage.toFixed(1)}% of portfolio`
      };
    }
    
    if (percentage > 25) {
      return {
        type: 'amount',
        severity: 0.6,
        description: `Significant transaction: ${percentage.toFixed(1)}% of portfolio`
      };
    }
    
    return null;
  }
  
  private assessChainRisk(chain: number): RiskFactor | null {
    const highRiskChains = [534351, 50104, 1014]; // Scroll, Sophon, Monad testnet
    
    if (highRiskChains.includes(chain)) {
      return {
        type: 'chain',
        severity: 0.5,
        description: 'Operating on newer/testnet chain'
      };
    }
    
    return null;
  }
  
  private async assessConcentrationRisk(action: any, address: string): Promise<RiskFactor | null> {
    try {
      const analytics = await portfolioAnalytics.getAnalytics(address);
      
      if (!analytics?.balancesByChain || !analytics?.totalValue) {
        return null;
      }
      
      const targetChain = action.toChain || action.chain;
      
      if (typeof targetChain !== 'number') {
        return null;
      }
      
      const currentValue = analytics.balancesByChain[targetChain]?.usdValue || 0;
      const actionAmount = typeof action.amount === 'number' ? action.amount : 0;
      const newValue = currentValue + actionAmount;
      const percentage = (newValue / analytics.totalValue) * 100;
      
      if (percentage > 70) {
        return {
          type: 'concentration',
          severity: 0.8,
          description: `High concentration on chain ${targetChain}: ${percentage.toFixed(1)}%`
        };
      }
      
      return null;
    } catch (error) {
      console.error('Concentration risk assessment failed:', error);
      return null;
    }
  }
  
  private calculateRiskScore(factors: RiskFactor[]): number {
    if (!Array.isArray(factors) || !factors.length) {
      return 0;
    }
    
    try {
      const totalSeverity = factors.reduce((sum, f) => {
        const severity = typeof f.severity === 'number' ? f.severity : 0;
        return sum + severity;
      }, 0);
      
      return Math.min(totalSeverity / factors.length, 1);
    } catch (error) {
      console.error('Risk score calculation failed:', error);
      return 0;
    }
  }
  
  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
  }
  
  private getRecommendation(level: string, factors: RiskFactor[]): string {
    if (level === 'critical') {
      return 'Action not recommended. Multiple high-risk factors detected.';
    }
    
    if (level === 'high') {
      return 'Proceed with caution. Consider reducing amount or waiting for better conditions.';
    }
    
    if (level === 'medium') {
      return 'Acceptable risk level. Monitor execution closely.';
    }
    
    return 'Low risk. Safe to proceed.';
  }
}

export const riskAssessor = new RiskAssessor();
