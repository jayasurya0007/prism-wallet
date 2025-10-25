// Real-Time Subscriptions
// Reference: https://docs.envio.dev/docs/HyperIndex/getting-started

import { TRANSFER_SUBSCRIPTION } from './queries';
import type { Transfer } from '../../types/envio';

export class EnvioSubscriptionManager {
  private subscriptions: Map<string, () => void> = new Map();

  // Subscribe to real-time transfer updates
  subscribeToTransfers(
    chainIds: number[],
    callback: (transfer: Transfer) => void
  ): () => void {
    // Validate inputs
    if (!Array.isArray(chainIds) || chainIds.length === 0) {
      throw new Error('Valid chain IDs array is required');
    }
    
    // Validate chain IDs
    for (const chainId of chainIds) {
      if (!Number.isInteger(chainId) || chainId <= 0) {
        throw new Error('Invalid chain ID');
      }
    }
    
    if (typeof callback !== 'function') {
      throw new Error('Valid callback function is required');
    }
    
    const subscriptionId = `transfers-${chainIds.join('-')}`;
    
    // Use polling as fallback for WebSocket subscriptions
    const pollInterval = setInterval(async () => {
      try {
        // Validate and sanitize endpoint URL
        const endpoint = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_ENDPOINT;
        if (!endpoint || typeof endpoint !== 'string') {
          throw new Error('GraphQL endpoint not configured');
        }
        
        // Strict URL validation to prevent SSRF
        if (!/^https:\/\/[a-zA-Z0-9.-]+(?:\:[0-9]+)?(?:\/[^\s]*)?$/.test(endpoint)) {
          throw new Error('Invalid or insecure GraphQL endpoint');
        }
        
        // Prevent requests to internal/private networks
        const url = new URL(endpoint);
        const hostname = url.hostname;
        
        // Block localhost, private IPs, and internal domains
        if (/^(localhost|127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.|::1|0:0:0:0:0:0:0:1)/.test(hostname)) {
          throw new Error('Requests to internal networks are not allowed');
        }
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'EnvioClient/1.0'
          },
          body: JSON.stringify({
            query: TRANSFER_SUBSCRIPTION,
            variables: { chainIds: chainIds.slice(0, 10) } // Limit to 10 chains max
          }),
          // Security settings
          redirect: 'error', // Don't follow redirects
          referrerPolicy: 'no-referrer'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response content type');
        }
        
        const data = await response.json();
        
        // Validate response structure
        if (data && typeof data === 'object' && data.data?.Transfer?.[0]) {
          // Validate transfer data before calling callback
          const transfer = data.data.Transfer[0];
          if (this.isValidTransfer(transfer)) {
            callback(transfer);
          }
        }
      } catch (error) {
        console.error('Subscription polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    const unsubscribe = () => {
      clearInterval(pollInterval);
      this.subscriptions.delete(subscriptionId);
    };

    this.subscriptions.set(subscriptionId, unsubscribe);
    return unsubscribe;
  }

  // Subscribe to high-value transfer alerts
  subscribeToHighValueAlerts(
    callback: (transfer: Transfer) => void,
    threshold: number = 10000
  ): () => void {
    // Validate inputs
    if (typeof callback !== 'function') {
      throw new Error('Valid callback function is required');
    }
    
    if (typeof threshold !== 'number' || threshold <= 0 || threshold > 1000000) {
      throw new Error('Threshold must be between 0 and 1,000,000');
    }
    
    return this.subscribeToTransfers([1, 137, 42161], (transfer) => {
      try {
        const value = parseFloat(transfer.value);
        if (isNaN(value) || value <= 0) return;
        
        const usdValue = value / 1e6; // USDC conversion
        if (usdValue > threshold) {
          callback(transfer);
        }
      } catch (error) {
        // Skip invalid transfer data
      }
    });
  }

  // Subscribe to wallet-specific activity
  subscribeToWalletActivity(
    address: string,
    chainIds: number[],
    callback: (transfer: Transfer) => void
  ): () => void {
    // Validate address format
    if (!address || typeof address !== 'string') {
      throw new Error('Valid address is required');
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid Ethereum address format');
    }
    
    return this.subscribeToTransfers(chainIds, (transfer) => {
      try {
        // Validate transfer addresses before comparison
        if (this.isValidAddress(transfer.from) && this.isValidAddress(transfer.to)) {
          if (transfer.from.toLowerCase() === address.toLowerCase() || 
              transfer.to.toLowerCase() === address.toLowerCase()) {
            callback(transfer);
          }
        }
      } catch (error) {
        // Skip invalid transfer data
      }
    });
  }

  // Validate transfer data structure
  private isValidTransfer(transfer: any): boolean {
    return transfer &&
           typeof transfer === 'object' &&
           typeof transfer.id === 'string' &&
           typeof transfer.chainId === 'number' &&
           typeof transfer.from === 'string' &&
           typeof transfer.to === 'string' &&
           typeof transfer.value === 'string' &&
           this.isValidAddress(transfer.from) &&
           this.isValidAddress(transfer.to);
  }
  
  // Validate Ethereum address format
  private isValidAddress(address: string): boolean {
    return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  // Cleanup all subscriptions
  cleanup() {
    this.subscriptions.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.subscriptions.clear();
  }
}

export const subscriptionManager = new EnvioSubscriptionManager();