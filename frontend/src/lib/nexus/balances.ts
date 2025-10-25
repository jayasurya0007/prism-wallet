import { nexusClient } from './client';
import type { TokenBalance, AggregatedBalance } from '../../types/nexus';

export class BalanceService {
  private cache = new Map<string, { data: TokenBalance[]; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  async getUnifiedBalances(address: string): Promise<AggregatedBalance[]> {
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
    return nexusClient.getBalances(address, [chainId]);
  }

  async getTotalPortfolioValue(address: string): Promise<number> {
    const aggregated = await this.getUnifiedBalances(address);
    return aggregated.reduce((total, balance) => total + balance.totalUsdValue, 0);
  }

  async getTopTokens(address: string, limit = 5): Promise<AggregatedBalance[]> {
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