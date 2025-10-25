// Gas Price Tracking
// Reference: https://docs.envio.dev/docs/HyperIndex/hypersync

import { envioClient } from './graphql-client';
import type { GasPrice } from '../../types/envio';

export class GasTracker {
  private readonly OPTIMAL_GAS_THRESHOLD = 50; // Gwei
  private readonly SUPPORTED_CHAINS = [1, 137, 42161, 10, 8453];

  // Track gas prices across chains
  async trackGasPrices(hours: number = 24) {
    try {
      const response = await envioClient.getGasPrices(this.SUPPORTED_CHAINS, hours);
      return response.data?.GasPrice || [];
    } catch (error) {
      console.error('Gas tracking failed:', error);
      return [];
    }
  }

  // Find optimal execution time
  async findOptimalGasTime(chainId: number) {
    const gasPrices = await this.trackGasPrices(24);
    const chainPrices = gasPrices.filter(g => g.chainId === chainId);
    
    return chainPrices
      .filter(g => parseFloat(g.gasPrice) < this.OPTIMAL_GAS_THRESHOLD)
      .sort((a, b) => parseFloat(a.gasPrice) - parseFloat(b.gasPrice))[0];
  }

  // Get current gas recommendations
  async getGasRecommendations() {
    const gasPrices = await this.trackGasPrices(1);
    
    return this.SUPPORTED_CHAINS.map(chainId => {
      const chainGas = gasPrices.filter(g => g.chainId === chainId);
      const avgGas = chainGas.reduce((sum, g) => sum + parseFloat(g.gasPrice), 0) / chainGas.length;
      
      return {
        chainId,
        currentGas: avgGas || 0,
        recommendation: avgGas < this.OPTIMAL_GAS_THRESHOLD ? 'execute' : 'wait',
        savings: Math.max(0, avgGas - this.OPTIMAL_GAS_THRESHOLD)
      };
    });
  }

  // Monitor gas price alerts
  async monitorGasAlerts(targetChains: number[], maxGasPrice: number) {
    const recommendations = await this.getGasRecommendations();
    
    return recommendations
      .filter(rec => targetChains.includes(rec.chainId))
      .filter(rec => rec.currentGas <= maxGasPrice)
      .map(rec => ({
        chainId: rec.chainId,
        message: `Gas below ${maxGasPrice} Gwei on chain ${rec.chainId}`,
        currentPrice: rec.currentGas
      }));
  }
}

export const gasTracker = new GasTracker();