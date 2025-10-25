// Gas Price Tracking
// Reference: https://docs.envio.dev/docs/HyperIndex/hypersync

import { envioClient } from './graphql-client';
import type { GasPrice } from '../../types/envio';

export class GasTracker {
  private readonly OPTIMAL_GAS_THRESHOLD = 50; // Gwei
  private readonly SUPPORTED_CHAINS = [1, 137, 42161, 10, 8453];

  // Track gas prices across chains
  async trackGasPrices(hours: number = 24) {
    // Validate hours input
    if (!Number.isInteger(hours) || hours <= 0 || hours > 168) {
      throw new Error('Hours must be between 1 and 168 (1 week)');
    }
    
    try {
      const response = await envioClient.getGasPrices(this.SUPPORTED_CHAINS, hours);
      const gasPrices = response.data?.GasPrice || [];
      
      // Validate gas price data
      return gasPrices.filter(this.isValidGasPrice);
    } catch (error) {
      console.error('Gas tracking failed');
      return [];
    }
  }

  // Find optimal execution time
  async findOptimalGasTime(chainId: number) {
    // Validate chain ID
    if (!Number.isInteger(chainId) || chainId <= 0) {
      throw new Error('Valid chain ID is required');
    }
    
    if (!this.SUPPORTED_CHAINS.includes(chainId)) {
      throw new Error('Unsupported chain ID');
    }
    
    const gasPrices = await this.trackGasPrices(24);
    const chainPrices = gasPrices.filter(g => g.chainId === chainId);
    
    return chainPrices
      .filter(g => {
        const gasPrice = parseFloat(g.gasPrice);
        return !isNaN(gasPrice) && gasPrice > 0 && gasPrice < this.OPTIMAL_GAS_THRESHOLD;
      })
      .sort((a, b) => parseFloat(a.gasPrice) - parseFloat(b.gasPrice))[0] || null;
  }

  // Get current gas recommendations
  async getGasRecommendations() {
    const gasPrices = await this.trackGasPrices(1);
    
    return this.SUPPORTED_CHAINS.map(chainId => {
      const chainGas = gasPrices.filter(g => g.chainId === chainId);
      
      let avgGas = 0;
      if (chainGas.length > 0) {
        const validPrices = chainGas
          .map(g => parseFloat(g.gasPrice))
          .filter(price => !isNaN(price) && price > 0);
        
        if (validPrices.length > 0) {
          avgGas = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
        }
      }
      
      return {
        chainId,
        currentGas: Math.round(avgGas * 100) / 100, // Round to 2 decimal places
        recommendation: avgGas > 0 && avgGas < this.OPTIMAL_GAS_THRESHOLD ? 'execute' : 'wait',
        savings: Math.max(0, Math.round((avgGas - this.OPTIMAL_GAS_THRESHOLD) * 100) / 100)
      };
    });
  }

  // Monitor gas price alerts
  async monitorGasAlerts(targetChains: number[], maxGasPrice: number) {
    // Validate inputs
    if (!Array.isArray(targetChains) || targetChains.length === 0) {
      throw new Error('Valid target chains array is required');
    }
    
    if (!Number.isFinite(maxGasPrice) || maxGasPrice <= 0 || maxGasPrice > 1000) {
      throw new Error('Max gas price must be between 0 and 1000 Gwei');
    }
    
    // Validate and filter target chains
    const validTargetChains = targetChains.filter(chainId => 
      Number.isInteger(chainId) && 
      chainId > 0 && 
      this.SUPPORTED_CHAINS.includes(chainId)
    ).slice(0, 10); // Limit to 10 chains
    
    if (validTargetChains.length === 0) {
      return [];
    }
    
    try {
      const recommendations = await this.getGasRecommendations();
      
      return recommendations
        .filter(rec => validTargetChains.includes(rec.chainId))
        .filter(rec => rec.currentGas > 0 && rec.currentGas <= maxGasPrice)
        .map(rec => ({
          chainId: rec.chainId,
          message: `Gas below ${maxGasPrice} Gwei on chain ${rec.chainId}`,
          currentPrice: rec.currentGas
        }));
    } catch (error) {
      console.error('Gas alert monitoring failed');
      return [];
    }
  }
  
  // Validate gas price data
  private isValidGasPrice(gasPrice: any): boolean {
    return gasPrice &&
           typeof gasPrice === 'object' &&
           typeof gasPrice.chainId === 'number' &&
           Number.isInteger(gasPrice.chainId) &&
           gasPrice.chainId > 0 &&
           typeof gasPrice.gasPrice === 'string' &&
           !isNaN(parseFloat(gasPrice.gasPrice)) &&
           parseFloat(gasPrice.gasPrice) > 0;
  }
}

export const gasTracker = new GasTracker();