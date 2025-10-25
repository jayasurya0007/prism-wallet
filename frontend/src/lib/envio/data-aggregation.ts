// Multi-Chain Data Aggregation
// Reference: https://docs.envio.dev/docs/HyperIndex/getting-started

import { envioClient } from './graphql-client';
import type { Transfer } from '../../types/envio';

export class DataAggregator {
  private readonly SUPPORTED_CHAINS = [1, 137, 42161, 10, 8453];

  // Aggregate portfolio data across all chains
  async aggregatePortfolioData(address: string) {
    const chainData = await Promise.allSettled(
      this.SUPPORTED_CHAINS.map(async (chainId) => {
        const response = await envioClient.getWalletActivity(address, [chainId]);
        return {
          chainId,
          transfers: response.data?.Transfer || [],
          totalVolume: this.calculateChainVolume(response.data?.Transfer || [])
        };
      })
    );

    const successfulChains = chainData
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    return {
      totalChains: successfulChains.length,
      totalTransfers: successfulChains.reduce((sum, chain) => sum + chain.transfers.length, 0),
      totalVolume: successfulChains.reduce((sum, chain) => sum + chain.totalVolume, 0),
      chainBreakdown: successfulChains,
      crossChainInsights: this.generateCrossChainInsights(successfulChains)
    };
  }

  // Calculate volume for a specific chain
  private calculateChainVolume(transfers: Transfer[]): number {
    return transfers.reduce((sum, transfer) => {
      return sum + (parseFloat(transfer.value) / 1e6); // USDC conversion
    }, 0);
  }

  // Generate cross-chain insights
  private generateCrossChainInsights(chainData: any[]) {
    const insights = [];
    
    // Find most active chain
    const mostActive = chainData.reduce((max, chain) => 
      chain.transfers.length > (max?.transfers.length || 0) ? chain : max, null
    );
    
    if (mostActive) {
      insights.push({
        type: 'most_active_chain',
        chainId: mostActive.chainId,
        metric: mostActive.transfers.length,
        message: `Most active on chain ${mostActive.chainId} with ${mostActive.transfers.length} transfers`
      });
    }

    // Find highest volume chain
    const highestVolume = chainData.reduce((max, chain) => 
      chain.totalVolume > (max?.totalVolume || 0) ? chain : max, null
    );
    
    if (highestVolume) {
      insights.push({
        type: 'highest_volume_chain',
        chainId: highestVolume.chainId,
        metric: highestVolume.totalVolume,
        message: `Highest volume on chain ${highestVolume.chainId}: $${highestVolume.totalVolume.toFixed(2)}`
      });
    }

    // Diversification score
    const activeChains = chainData.filter(chain => chain.transfers.length > 0).length;
    insights.push({
      type: 'diversification',
      metric: activeChains / this.SUPPORTED_CHAINS.length,
      message: `Portfolio diversified across ${activeChains}/${this.SUPPORTED_CHAINS.length} chains`
    });

    return insights;
  }

  // Aggregate market data across chains
  async aggregateMarketData() {
    const recentTransfers = await Promise.allSettled(
      this.SUPPORTED_CHAINS.map(chainId => 
        envioClient.getRecentTransfers(60, [chainId])
      )
    );

    const allTransfers = recentTransfers
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .flatMap(result => result.value.data?.Transfer || []);

    return {
      totalRecentTransfers: allTransfers.length,
      averageTransferSize: this.calculateAverageTransferSize(allTransfers),
      chainActivity: this.calculateChainActivity(allTransfers),
      marketTrends: this.analyzeMarketTrends(allTransfers)
    };
  }

  private calculateAverageTransferSize(transfers: Transfer[]): number {
    if (transfers.length === 0) return 0;
    const totalValue = transfers.reduce((sum, t) => sum + parseFloat(t.value), 0);
    return (totalValue / transfers.length) / 1e6; // Convert to USD
  }

  private calculateChainActivity(transfers: Transfer[]) {
    const activity: Record<number, number> = {};
    transfers.forEach(transfer => {
      activity[transfer.chainId] = (activity[transfer.chainId] || 0) + 1;
    });
    return activity;
  }

  private analyzeMarketTrends(transfers: Transfer[]) {
    const hourlyActivity: Record<number, number> = {};
    const now = Math.floor(Date.now() / 1000);
    
    transfers.forEach(transfer => {
      const hour = Math.floor((now - transfer.timestamp) / 3600);
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    return {
      peakHour: Object.entries(hourlyActivity).reduce((max, [hour, count]) => 
        count > (max[1] || 0) ? [parseInt(hour), count] : max, [0, 0]
      ),
      activityTrend: Object.keys(hourlyActivity).length > 1 ? 'increasing' : 'stable'
    };
  }
}

export const dataAggregator = new DataAggregator();