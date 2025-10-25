// High-Value Transfer Monitoring
// Reference: https://docs.envio.dev/docs/HyperIndex/hypersync

import { envioClient } from './graphql-client';
import type { Transfer, HighValueTransfer } from '../../types/envio';

export class TransferMonitor {
  private readonly HIGH_VALUE_THRESHOLD = 10000; // $10k USD
  private callbacks: Array<(transfer: HighValueTransfer) => void> = [];

  // Monitor high-value transfers across chains
  async monitorHighValueTransfers(chainIds: number[] = [1, 137, 42161]) {
    // Validate chain IDs
    if (!Array.isArray(chainIds)) {
      throw new Error('Chain IDs must be an array');
    }
    
    const validChainIds = chainIds.filter(id => 
      Number.isInteger(id) && id > 0 && id <= 999999
    ).slice(0, 10); // Limit to 10 chains
    
    if (validChainIds.length === 0) {
      return [];
    }
    
    try {
      const response = await envioClient.getHighValueTransfers();
      const transfers = response.data?.HighValueTransfer || [];
      
      transfers.forEach(transfer => {
        // Validate transfer data
        if (this.isValidHighValueTransfer(transfer) && 
            transfer.usdValue > this.HIGH_VALUE_THRESHOLD) {
          this.notifyCallbacks(transfer);
        }
      });
      
      return transfers;
    } catch (error) {
      console.error('High-value transfer monitoring failed');
      return [];
    }
  }

  // Real-time transfer detection
  async detectLargeMovements(address: string, chainIds: number[]) {
    // Validate address
    if (!address || typeof address !== 'string') {
      throw new Error('Valid address is required');
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid Ethereum address format');
    }
    
    // Validate chain IDs
    if (!Array.isArray(chainIds) || chainIds.length === 0) {
      throw new Error('Valid chain IDs array is required');
    }
    
    const validChainIds = chainIds.filter(id => 
      Number.isInteger(id) && id > 0 && id <= 999999
    ).slice(0, 10);
    
    if (validChainIds.length === 0) {
      return [];
    }
    
    try {
      const transfers = await envioClient.getWalletActivity(address, validChainIds);
      
      return transfers.data?.Transfer?.filter(transfer => {
        // Validate transfer data
        if (!this.isValidTransfer(transfer)) return false;
        
        const amount = parseFloat(transfer.amount);
        if (isNaN(amount) || amount <= 0) return false;
        
        return amount > this.HIGH_VALUE_THRESHOLD * 1e6; // USDC has 6 decimals
      }) || [];
    } catch (error) {
      console.error('Large movement detection failed');
      return [];
    }
  }

  // Subscribe to transfer notifications
  onHighValueTransfer(callback: (transfer: HighValueTransfer) => void) {
    if (typeof callback !== 'function') {
      throw new Error('Valid callback function is required');
    }
    
    this.callbacks.push(callback);
  }

  private notifyCallbacks(transfer: HighValueTransfer) {
    this.callbacks.forEach(callback => {
      try {
        if (typeof callback === 'function') {
          callback(transfer);
        }
      } catch (error) {
        console.error('Callback execution failed');
      }
    });
  }
  
  // Validate high-value transfer data
  private isValidHighValueTransfer(transfer: any): boolean {
    return transfer &&
           typeof transfer === 'object' &&
           typeof transfer.id === 'string' &&
           typeof transfer.usdValue === 'number' &&
           !isNaN(transfer.usdValue) &&
           transfer.usdValue >= 0;
  }
  
  // Validate transfer data
  private isValidTransfer(transfer: any): boolean {
    return transfer &&
           typeof transfer === 'object' &&
           typeof transfer.amount === 'string' &&
           typeof transfer.from === 'string' &&
           typeof transfer.to === 'string' &&
           /^0x[a-fA-F0-9]{40}$/.test(transfer.from) &&
           /^0x[a-fA-F0-9]{40}$/.test(transfer.to);
  }
}

export const transferMonitor = new TransferMonitor();