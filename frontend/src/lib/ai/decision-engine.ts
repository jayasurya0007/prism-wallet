import { portfolioAnalytics } from '../envio/portfolio-analytics';
import { yieldDetector } from '../envio/yield-detector';
import { gasTracker } from '../envio/gas-tracker';

export interface DecisionContext {
  portfolioValue: number;
  gasPrice: number;
  yieldOpportunities: any[];
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface Decision {
  action: 'bridge' | 'yield' | 'rebalance' | 'hold';
  confidence: number;
  reasoning: string;
  params?: any;
}

export class DecisionEngine {
  async analyzePortfolio(address: string, context: DecisionContext): Promise<Decision> {
    if (!address || typeof address !== 'string') {
      throw new Error('Invalid address');
    }
    
    if (!context || typeof context !== 'object') {
      throw new Error('Invalid context');
    }
    
    try {
      const analytics = await portfolioAnalytics.getAnalytics(address);
      
      if (!analytics) {
        return {
          action: 'hold',
          confidence: 0.5,
          reasoning: 'Unable to fetch analytics'
        };
      }
      
      if (this.shouldRebalance(analytics, context)) {
        return {
          action: 'rebalance',
          confidence: 0.85,
          reasoning: 'Portfolio imbalance detected across chains',
          params: this.calculateRebalanceParams(analytics)
        };
      }
      
      const yieldOpp = await this.findBestYield(context);
      if (yieldOpp && typeof yieldOpp.apy === 'number' && yieldOpp.apy > 5) {
        return {
          action: 'yield',
          confidence: 0.75,
          reasoning: `High yield opportunity: ${yieldOpp.apy}% APY`,
          params: yieldOpp
        };
      }
      
      if (typeof context.gasPrice === 'number' && context.gasPrice < 20) {
        return {
          action: 'bridge',
          confidence: 0.65,
          reasoning: 'Low gas prices - optimal for cross-chain operations',
          params: { gasPrice: context.gasPrice }
        };
      }
      
      return {
        action: 'hold',
        confidence: 0.9,
        reasoning: 'No optimization opportunities detected'
      };
    } catch (error) {
      console.error('Portfolio analysis failed:', error);
      return {
        action: 'hold',
        confidence: 0.5,
        reasoning: 'Analysis failed - holding position'
      };
    }
  }
  
  private shouldRebalance(analytics: any, context: DecisionContext): boolean {
    try {
      if (!analytics?.balancesByChain || typeof analytics.balancesByChain !== 'object') {
        return false;
      }
      
      const chains = Object.keys(analytics.balancesByChain);
      if (chains.length < 2) return false;
      
      const values = chains
        .map(c => analytics.balancesByChain[c]?.usdValue)
        .filter(v => typeof v === 'number');
      
      if (values.length < 2) return false;
      
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      if (max === 0) return false;
      
      return (max - min) / max > 0.5;
    } catch (error) {
      console.error('Rebalance check failed:', error);
      return false;
    }
  }
  
  private calculateRebalanceParams(analytics: any): any {
    try {
      if (!analytics?.balancesByChain || !analytics?.totalValue) {
        return { targetDistribution: [] };
      }
      
      const chains = Object.keys(analytics.balancesByChain);
      const totalValue = analytics.totalValue;
      const targetPerChain = totalValue / chains.length;
      
      return {
        targetDistribution: chains.map(chain => ({
          chain: Number(chain),
          target: targetPerChain,
          current: analytics.balancesByChain[chain]?.usdValue || 0
        }))
      };
    } catch (error) {
      console.error('Rebalance params calculation failed:', error);
      return { targetDistribution: [] };
    }
  }
  
  private async findBestYield(context: DecisionContext): Promise<any> {
    try {
      if (!Array.isArray(context.yieldOpportunities) || !context.yieldOpportunities.length) {
        return null;
      }
      
      return context.yieldOpportunities.reduce((best, current) => {
        const currentApy = typeof current?.apy === 'number' ? current.apy : 0;
        const bestApy = typeof best?.apy === 'number' ? best.apy : 0;
        return currentApy > bestApy ? current : best;
      }, null);
    } catch (error) {
      console.error('Best yield search failed:', error);
      return null;
    }
  }
}

export const decisionEngine = new DecisionEngine();
