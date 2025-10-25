import { nexusClient } from './client';
import type { TokenBalance, AggregatedBalance } from '../../types/nexus';

export class BalanceService {
  private cache = new Map<string, { data: TokenBalance[]; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  async getUnifiedBalances(address: string): Promise<AggregatedBalance[]> {
    // Validate address format
    if (!address || typeof address !== 'string') {
      throw new Error('Valid address is required');
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid Ethereum address format');
    }
    


    const cacheKey = `balances_${address}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return this.aggregateBalances(cached.data);
    }

    const balances = await nexusClient.getBalances(address);
    this.cache.set(cacheKey, { data: balances, timestamp: Date.now() });
    
    return this.aggregateBalances(balances);
  }

  async getBalancesByChain(address: string, chainId: number): Promise<TokenBalance[]> {
    // Validate chain ID
    if (!Number.isInteger(chainId) || chainId <= 0) {
      throw new Error('Invalid chain ID');
    }
    
    return nexusClient.getBalances(address, [chainId]);
  }

  async getTotalPortfolioValue(address: string): Promise<number> {
    // Validation is handled by getUnifiedBalances
    const aggregated = await this.getUnifiedBalances(address);
    return aggregated.reduce((total, balance) => total + balance.totalUsdValue, 0);
  }

  async getTopTokens(address: string, limit = 5): Promise<AggregatedBalance[]> {
    // Validate limit
    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      throw new Error('Limit must be a positive integer between 1 and 100');
    }
    
    // Validation for address is handled by getUnifiedBalances
    const aggregated = await this.getUnifiedBalances(address);
    return aggregated
      .sort((a, b) => b.totalUsdValue - a.totalUsdValue)
      .slice(0, limit);
  }

  private aggregateBalances(balances: TokenBalance[]): AggregatedBalance[] {
    const aggregated = new Map<string, AggregatedBalance>();

    for (const balance of balances) {
      const key = balance.symbol;
      if (!aggregated.has(key)) {
        aggregated.set(key, {
          token: balance.address,
          symbol: balance.symbol,
          totalBalance: '0',
          totalUsdValue: 0,
          balancesByChain: {}
        });
      }

      const agg = aggregated.get(key)!;
      agg.balancesByChain[balance.chainId] = balance;
      agg.totalBalance = (BigInt(agg.totalBalance) + BigInt(balance.balance)).toString();
      agg.totalUsdValue += balance.usdValue || 0;
    }

    return Array.from(aggregated.values());
  }



  clearCache(): void {
    this.cache.clear();
  }
}

export const balanceService = new BalanceService();