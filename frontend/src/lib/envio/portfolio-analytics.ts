// Portfolio Analytics and Insights
// Reference: https://docs.envio.dev/docs/HyperIndex/hypersync

import { envioClient } from './graphql-client';
import { transferMonitor } from './event-handlers';
import { yieldDetector } from './yield-detector';
import { gasTracker } from './gas-tracker';
import type { PortfolioAnalytics } from '../../types/envio';

export class PortfolioAnalyzer {
  // Generate comprehensive portfolio insights
  async analyzePortfolio(address: string) {
    const [
      analytics,
      yieldOpportunities,
      gasRecommendations,
      highValueActivity
    ] = await Promise.all([
      envioClient.getPortfolioAnalytics(address),
      yieldDetector.detectYieldOpportunities(),
      gasTracker.getGasRecommendations(),
      transferMonitor.monitorHighValueTransfers()
    ]);

    return {
      ...analytics,
      yieldOpportunities: yieldOpportunities.slice(0, 5),
      gasOptimization: gasRecommendations,
      riskMetrics: this.calculateRiskMetrics(analytics),
      recommendations: this.generateRecommendations(analytics, yieldOpportunities)
    };
  }

  // Calculate portfolio risk metrics
  private calculateRiskMetrics(analytics: any) {
    const totalTx = analytics.totalTransactions || 0;
    const chainCount = Object.keys(analytics.chainDistribution || {}).length;
    
    return {
      diversificationScore: Math.min(chainCount / 5, 1), // Max 5 chains
      activityLevel: totalTx > 100 ? 'high' : totalTx > 20 ? 'medium' : 'low',
      riskLevel: chainCount > 3 ? 'distributed' : 'concentrated'
    };
  }

  // Generate AI recommendations
  private generateRecommendations(analytics: any, yields: any[]) {
    const recommendations = [];
    
    if (yields.length > 0) {
      recommendations.push({
        type: 'yield',
        message: `Consider ${yields[0].protocol} offering ${yields[0].apy}% APY`,
        priority: 'high'
      });
    }
    
    const chainCount = Object.keys(analytics.chainDistribution || {}).length;
    if (chainCount < 3) {
      recommendations.push({
        type: 'diversification',
        message: 'Consider diversifying across more chains',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  // Real-time portfolio monitoring
  async startMonitoring(address: string, callback: (update: any) => void) {
    // Monitor transfers
    transferMonitor.onHighValueTransfer((transfer) => {
      if (transfer.from === address || transfer.to === address) {
        callback({
          type: 'high_value_transfer',
          data: transfer,
          timestamp: Date.now()
        });
      }
    });

    // Monitor yield changes
    setInterval(async () => {
      const yields = await yieldDetector.detectYieldOpportunities();
      callback({
        type: 'yield_update',
        data: yields.slice(0, 3),
        timestamp: Date.now()
      });
    }, 300000); // 5 minutes

    // Monitor gas prices
    setInterval(async () => {
      const gasAlerts = await gasTracker.monitorGasAlerts([1, 137, 42161], 100);
      if (gasAlerts.length > 0) {
        callback({
          type: 'gas_alert',
          data: gasAlerts,
          timestamp: Date.now()
        });
      }
    }, 60000); // 1 minute
  }
}

export const portfolioAnalyzer = new PortfolioAnalyzer();