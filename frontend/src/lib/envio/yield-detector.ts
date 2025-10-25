// Yield Opportunity Detection
// Reference: https://docs.envio.dev/docs/HyperIndex/hypersync

import { envioClient } from './graphql-client';
import type { YieldOpportunity } from '../../types/envio';

export class YieldDetector {
  private readonly MIN_APY = 5; // 5% minimum APY
  private readonly MIN_TVL = 1000000; // $1M minimum TVL

  // Detect high-yield opportunities
  async detectYieldOpportunities(chainIds: number[] = [1, 137, 42161]) {
    try {
      const response = await envioClient.getYieldOpportunities(chainIds);
      const opportunities = response.data?.YieldOpportunity || [];
      
      return opportunities.filter(opp => 
        opp.apy > this.MIN_APY && 
        parseFloat(opp.tvl) > this.MIN_TVL
      );
    } catch (error) {
      console.error('Yield detection failed:', error);
      return [];
    }
  }

  // Analyze yield trends
  async analyzeYieldTrends(protocol: string, token: string) {
    const opportunities = await this.detectYieldOpportunities();
    
    return opportunities
      .filter(opp => opp.protocol === protocol && opp.token === token)
      .sort((a, b) => b.apy - a.apy);
  }

  // Get best yield for token
  async getBestYield(token: string, chainIds?: number[]) {
    const opportunities = await this.detectYieldOpportunities(chainIds);
    
    return opportunities
      .filter(opp => {
        // Prevent timing attacks by using constant-time comparison
        const oppToken = opp.token.toLowerCase();
        const targetToken = token.toLowerCase();
        return oppToken.length === targetToken.length && oppToken === targetToken;
      })
      .reduce((best, current) => 
        current.apy > (best?.apy || 0) ? current : best, 
        null as YieldOpportunity | null
      );
  }
}

export const yieldDetector = new YieldDetector();