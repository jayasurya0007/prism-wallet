import { yieldDetector } from '../envio/yield-detector';
import { gasTracker } from '../envio/gas-tracker';

export interface YieldStrategy {
  protocol: string;
  chain: number;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  estimatedGas: number;
}

export class YieldOptimizer {
  async findOptimalYield(amount: number, token: string, riskTolerance: 'low' | 'medium' | 'high'): Promise<YieldStrategy | null> {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid amount');
    }
    
    if (typeof token !== 'string' || token.length === 0) {
      throw new Error('Invalid token');
    }
    
    const opportunities = await yieldDetector.detectOpportunities();
    const gasPrices = await gasTracker.getGasPrices();
    
    if (!opportunities || !gasPrices) {
      return null;
    }
    
    const filtered = opportunities.filter(opp => 
      opp.token === token && this.matchesRiskTolerance(opp.risk, riskTolerance)
    );
    
    if (!filtered.length) return null;
    
    return filtered.reduce((best, current) => {
      const currentNet = this.calculateNetYield(current, gasPrices[current.chain], amount);
      const bestNet = best ? this.calculateNetYield(best, gasPrices[best.chain], amount) : 0;
      return currentNet > bestNet ? current : best;
    }, null as YieldStrategy | null);
  }
  
  private matchesRiskTolerance(risk: string, tolerance: string): boolean {
    const riskLevels: Record<string, number> = { low: 1, medium: 2, high: 3 };
    
    const riskLevel = riskLevels[risk];
    const toleranceLevel = riskLevels[tolerance];
    
    const isValidRisk = typeof riskLevel === 'number';
    const isValidTolerance = typeof toleranceLevel === 'number';
    
    if (!isValidRisk || !isValidTolerance) {
      return false;
    }
    
    const result = riskLevel <= toleranceLevel;
    return result;
  }
  
  private calculateNetYield(strategy: YieldStrategy, gasPrice: number, amount: number): number {
    const grossYield = (amount * strategy.apy) / 100;
    const gasCost = (strategy.estimatedGas * gasPrice) / 1e9;
    return grossYield - gasCost;
  }
  
  async compareStrategies(amount: number, token: string): Promise<YieldStrategy[]> {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid amount');
    }
    
    if (typeof token !== 'string' || token.length === 0) {
      throw new Error('Invalid token');
    }
    
    try {
      const opportunities = await yieldDetector.detectOpportunities();
      const gasPrices = await gasTracker.getGasPrices();
      
      if (!opportunities || !gasPrices) {
        return [];
      }
      
      return opportunities
        .filter(opp => opp.token === token)
        .map(opp => ({
          ...opp,
          netApy: this.calculateNetYield(opp, gasPrices[opp.chain], amount) / amount * 100
        }))
        .sort((a, b) => (b as any).netApy - (a as any).netApy);
    } catch (error) {
      console.error('Strategy comparison failed:', error);
      return [];
    }
  }
}

export const yieldOptimizer = new YieldOptimizer();
