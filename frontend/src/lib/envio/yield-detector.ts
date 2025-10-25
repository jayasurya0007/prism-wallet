// Yield Opportunity Detection
// Reference: https://docs.envio.dev/docs/HyperIndex/hypersync

import { envioClient } from './graphql-client';
import type { YieldOpportunity } from '../../types/envio';

export class YieldDetector {
  private readonly MIN_APY = 5; // 5% minimum APY
  private readonly MIN_TVL = 1000000; // $1M minimum TVL

  // Detect high-yield opportunities
  async detectYieldOpportunities(chainIds: number[] = [1, 137, 42161]) {
    // Validate input
    if (!Array.isArray(chainIds)) {
      throw new Error('Chain IDs must be an array');
    }
    
    // Validate and sanitize chain IDs
    const validChainIds = chainIds.filter(id => 
      Number.isInteger(id) && id > 0 && id <= 999999
    ).slice(0, 20); // Limit to 20 chains max
    
    if (validChainIds.length === 0) {
      return [];
    }
    
    try {
      const response = await envioClient.getYieldOpportunities(validChainIds);
      const opportunities = response.data?.YieldOpportunity || [];
      
      return opportunities.filter(opp => {
        // Validate opportunity data
        if (!opp || typeof opp !== 'object') return false;
        if (typeof opp.apy !== 'number' || isNaN(opp.apy)) return false;
        if (typeof opp.tvl !== 'string') return false;
        
        const tvlValue = parseFloat(opp.tvl);
        if (isNaN(tvlValue)) return false;
        
        return opp.apy > this.MIN_APY && tvlValue > this.MIN_TVL;
      });
    } catch (error) {
      console.error('Yield detection failed');
      return [];
    }
  }

  // Analyze yield trends
  async analyzeYieldTrends(protocol: string, token: string) {
    // Validate inputs
    if (!protocol || typeof protocol !== 'string') {
      throw new Error('Valid protocol name is required');
    }
    
    if (!token || typeof token !== 'string') {
      throw new Error('Valid token symbol is required');
    }
    
    // Sanitize inputs
    const sanitizedProtocol = protocol.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 50);
    const sanitizedToken = token.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    
    if (!sanitizedProtocol || !sanitizedToken) {
      return [];
    }
    
    const opportunities = await this.detectYieldOpportunities();
    
    return opportunities
      .filter(opp => {
        // Use constant-time comparison to prevent timing attacks
        return this.constantTimeStringCompare(opp.protocol, sanitizedProtocol) &&
               this.constantTimeStringCompare(opp.token, sanitizedToken);
      })
      .sort((a, b) => b.apy - a.apy);
  }

  // Get best yield for token
  async getBestYield(token: string, chainIds?: number[]) {
    // Validate token input
    if (!token || typeof token !== 'string') {
      throw new Error('Valid token symbol is required');
    }
    
    // Sanitize token input
    const sanitizedToken = token.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    if (!sanitizedToken) {
      return null;
    }
    
    const opportunities = await this.detectYieldOpportunities(chainIds);
    
    return opportunities
      .filter(opp => {
        // Use constant-time comparison to prevent timing attacks
        return this.constantTimeStringCompare(opp.token, sanitizedToken);
      })
      .reduce((best, current) => {
        // Validate APY values
        if (typeof current.apy !== 'number' || isNaN(current.apy)) {
          return best;
        }
        
        const bestApy = best?.apy || 0;
        return current.apy > bestApy ? current : best;
      }, null as YieldOpportunity | null);
  }
  
  // Constant-time string comparison to prevent timing attacks
  private constantTimeStringCompare(a: string, b: string): boolean {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    
    // Normalize strings
    const strA = a.toLowerCase().trim();
    const strB = b.toLowerCase().trim();
    
    // Always compare the same number of characters
    const maxLength = Math.max(strA.length, strB.length, 32);
    let result = strA.length === strB.length ? 0 : 1;
    
    for (let i = 0; i < maxLength; i++) {
      const charA = i < strA.length ? strA.charCodeAt(i) : 0;
      const charB = i < strB.length ? strB.charCodeAt(i) : 0;
      result |= charA ^ charB;
    }
    
    return result === 0;
  }
}

export const yieldDetector = new YieldDetector();