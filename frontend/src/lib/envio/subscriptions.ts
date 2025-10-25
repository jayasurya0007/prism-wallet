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
    const subscriptionId = `transfers-${chainIds.join('-')}`;
    
    // Use polling as fallback for WebSocket subscriptions
    const pollInterval = setInterval(async () => {
      try {
        // This would be replaced with actual WebSocket subscription in production
        const response = await fetch(process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: TRANSFER_SUBSCRIPTION,
            variables: { chainIds }
          })
        });
        
        const data = await response.json();
        if (data.data?.Transfer?.[0]) {
          callback(data.data.Transfer[0]);
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
    return this.subscribeToTransfers([1, 137, 42161], (transfer) => {
      const usdValue = parseFloat(transfer.value) / 1e6; // USDC conversion
      if (usdValue > threshold) {
        callback(transfer);
      }
    });
  }

  // Subscribe to wallet-specific activity
  subscribeToWalletActivity(
    address: string,
    chainIds: number[],
    callback: (transfer: Transfer) => void
  ): () => void {
    return this.subscribeToTransfers(chainIds, (transfer) => {
      if (transfer.from === address || transfer.to === address) {
        callback(transfer);
      }
    });
  }

  // Cleanup all subscriptions
  cleanup() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

export const subscriptionManager = new EnvioSubscriptionManager();