// High-Value Transfer Monitoring
// Reference: https://docs.envio.dev/docs/HyperIndex/hypersync

import { envioClient } from './graphql-client';
import type { Transfer, HighValueTransfer } from '../../types/envio';

export class TransferMonitor {
  private readonly HIGH_VALUE_THRESHOLD = 10000; // $10k USD
  private callbacks: Array<(transfer: HighValueTransfer) => void> = [];

  // Monitor high-value transfers across chains
  async monitorHighValueTransfers(chainIds: number[] = [1, 137, 42161]) {
    try {
      const response = await envioClient.getHighValueTransfers();
      const transfers = response.data?.HighValueTransfer || [];
      
      transfers.forEach(transfer => {
        if (transfer.usdValue > this.HIGH_VALUE_THRESHOLD) {
          this.notifyCallbacks(transfer);
        }
      });
      
      return transfers;
    } catch (error) {
      console.error('High-value transfer monitoring failed:', error);
      return [];
    }
  }

  // Real-time transfer detection
  async detectLargeMovements(address: string, chainIds: number[]) {
    const transfers = await envioClient.getWalletActivity(address, chainIds);
    
    return transfers.data?.Transfer?.filter(transfer => {
      const amount = parseFloat(transfer.amount);
      return amount > this.HIGH_VALUE_THRESHOLD * 1e6; // USDC has 6 decimals
    }) || [];
  }

  // Subscribe to transfer notifications
  onHighValueTransfer(callback: (transfer: HighValueTransfer) => void) {
    this.callbacks.push(callback);
  }

  private notifyCallbacks(transfer: HighValueTransfer) {
    this.callbacks.forEach(callback => callback(transfer));
  }
}

export const transferMonitor = new TransferMonitor();