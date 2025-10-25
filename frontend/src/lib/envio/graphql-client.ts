// Envio GraphQL Client
// Reference: https://docs.envio.dev/docs/HyperIndex/getting-started

import { GraphQLClient } from 'graphql-request';
import type { 
  Transfer, 
  HighValueTransfer, 
  Approval, 
  GasPrice, 
  YieldOpportunity, 
  PortfolioAnalytics,
  EnvioQueryResponse 
} from '../../types/envio';

export class EnvioGraphQLClient {
  private client: GraphQLClient;
  private endpoint: string;

  constructor() {
    this.endpoint = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql';
    this.client = new GraphQLClient(this.endpoint, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Query high-value transfers for AI agent monitoring
  async getHighValueTransfers(chainId?: number, limit: number = 100): Promise<EnvioQueryResponse<{ HighValueTransfer: HighValueTransfer[] }>> {
    const query = `
      query GetHighValueTransfers($chainId: Int, $limit: Int!) {
        HighValueTransfer(
          where: ${chainId ? '{ chainId: { _eq: $chainId } }' : '{}'}
          order_by: { timestamp: desc }
          limit: $limit
        ) {
          id
          chainId
          token
          from
          to
          amount
          usdValue
          blockNumber
          transactionHash
          timestamp
          flagged
        }
      }
    `;

    return await this.client.request(query, { chainId, limit });
  }

  // Query wallet activity for portfolio analysis
  async getWalletActivity(address: string, chainIds?: number[]): Promise<EnvioQueryResponse<{ Transfer: Transfer[] }>> {
    const query = `
      query GetWalletActivity($address: String!, $chainIds: [Int!]) {
        Transfer(
          where: {
            _or: [
              { from: { _eq: $address } }
              { to: { _eq: $address } }
            ]
            ${chainIds ? 'chainId: { _in: $chainIds }' : ''}
          }
          order_by: { timestamp: desc }
          limit: 1000
        ) {
          id
          chainId
          token
          from
          to
          amount
          blockNumber
          transactionHash
          timestamp
        }
      }
    `;

    return await this.client.request(query, { address, chainIds });
  }

  // Query recent transfers for real-time monitoring
  async getRecentTransfers(minutes: number = 60, chainId?: number) {
    const timestampThreshold = Math.floor(Date.now() / 1000) - (minutes * 60);
    
    const query = `
      query GetRecentTransfers($timestamp: Int!, $chainId: Int) {
        Transfer(
          where: {
            timestamp: { _gte: $timestamp }
            ${chainId ? 'chainId: { _eq: $chainId }' : ''}
          }
          order_by: { timestamp: desc }
          limit: 500
        ) {
          id
          chainId
          token
          from
          to
          amount
          blockNumber
          transactionHash
          timestamp
        }
      }
    `;

    return await this.client.request(query, { timestamp: timestampThreshold, chainId });
  }

  // Query gas prices for optimization
  async getGasPrices(chainIds: number[], hours: number = 24) {
    const timestampThreshold = Math.floor(Date.now() / 1000) - (hours * 3600);
    
    const query = `
      query GetGasPrices($chainIds: [Int!]!, $timestamp: Int!) {
        GasPrice(
          where: {
            chainId: { _in: $chainIds }
            timestamp: { _gte: $timestamp }
          }
          order_by: { timestamp: desc }
          limit: 1000
        ) {
          id
          chainId
          gasPrice
          blockNumber
          timestamp
        }
      }
    `;

    return await this.client.request(query, { chainIds, timestamp: timestampThreshold });
  }

  // Query yield opportunities
  async getYieldOpportunities(chainIds?: number[]) {
    const query = `
      query GetYieldOpportunities($chainIds: [Int!]) {
        YieldOpportunity(
          where: {
            active: { _eq: true }
            ${chainIds ? 'chainId: { _in: $chainIds }' : ''}
          }
          order_by: { apy: desc }
          limit: 50
        ) {
          id
          protocol
          chainId
          token
          apy
          tvl
          timestamp
          active
        }
      }
    `;

    return await this.client.request(query, { chainIds });
  }

  // Subscribe to real-time updates
  async subscribeToTransfers(callback: (data: any) => void, chainId?: number) {
    const subscription = `
      subscription TransferUpdates($chainId: Int) {
        Transfer(
          where: ${chainId ? '{ chainId: { _eq: $chainId } }' : '{}'}
          order_by: { timestamp: desc }
          limit: 1
        ) {
          id
          chainId
          token
          from
          to
          amount
          blockNumber
          transactionHash
          timestamp
        }
      }
    `;

    // Note: WebSocket subscription would be implemented here
    // For now, we'll use polling as a fallback
    const pollInterval = setInterval(async () => {
      try {
        const data = await this.getRecentTransfers(1, chainId);
        callback(data);
      } catch (error) {
        console.error('Subscription polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }

  // Get portfolio analytics
  async getPortfolioAnalytics(address: string) {
    const transfers = await this.getWalletActivity(address);
    const highValueTransfers = await this.getHighValueTransfers();
    
    // Process analytics
    const analytics = {
      totalTransactions: transfers.Transfer?.length || 0,
      totalVolume: this.calculateTotalVolume(transfers.Transfer || []),
      chainDistribution: this.calculateChainDistribution(transfers.Transfer || []),
      recentActivity: transfers.Transfer?.slice(0, 10) || [],
      highValueActivity: highValueTransfers.HighValueTransfer?.filter((t: any) => 
        t.from === address || t.to === address
      ) || []
    };

    return analytics;
  }

  private calculateTotalVolume(transfers: any[]): Record<string, number> {
    const volume: Record<string, number> = {};
    
    transfers.forEach(transfer => {
      const key = `${transfer.chainId}-${transfer.token}`;
      volume[key] = (volume[key] || 0) + parseFloat(transfer.amount);
    });

    return volume;
  }

  private calculateChainDistribution(transfers: any[]): Record<number, number> {
    const distribution: Record<number, number> = {};
    
    transfers.forEach(transfer => {
      distribution[transfer.chainId] = (distribution[transfer.chainId] || 0) + 1;
    });

    return distribution;
  }
}

export const envioClient = new EnvioGraphQLClient();