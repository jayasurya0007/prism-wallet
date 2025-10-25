// Envio GraphQL Client
// Reference: https://docs.envio.dev/docs/HyperIndex/getting-started

import { GraphQLClient } from 'graphql-request';
import { 
  HIGH_VALUE_TRANSFERS,
  WALLET_ACTIVITY,
  RECENT_TRANSFERS,
  PORTFOLIO_SUMMARY,
  TRANSFER_SUBSCRIPTION
} from './queries';
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
    const endpoint = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql';
    
    // Validate endpoint URL
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('GraphQL endpoint is required');
    }
    
    // Validate URL format and security
    if (!/^https?:\/\/[a-zA-Z0-9.-]+(?:\:[0-9]+)?(?:\/[^\s]*)?$/.test(endpoint)) {
      throw new Error('Invalid GraphQL endpoint format');
    }
    
    this.endpoint = endpoint;
    this.client = new GraphQLClient(this.endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EnvioClient/1.0'
      },
      // Security settings
      timeout: 30000, // 30 second timeout
      credentials: 'omit' // Don't send credentials
    });
  }

  // Query high-value transfers for AI agent monitoring
  async getHighValueTransfers(chainId?: number, limit: number = 100): Promise<EnvioQueryResponse<{ Transfer: Transfer[] }>> {
    // Validate inputs
    if (chainId !== undefined) {
      if (!Number.isInteger(chainId) || chainId <= 0) {
        throw new Error('Invalid chain ID');
      }
    }
    
    if (!Number.isInteger(limit) || limit <= 0 || limit > 1000) {
      throw new Error('Limit must be between 1 and 1000');
    }
    
    const minAmount = (10000 * 1e6).toString(); // $10k in USDC
    
    try {
      return await this.client.request(HIGH_VALUE_TRANSFERS, { 
        chainId, 
        minAmount, 
        limit: Math.min(limit, 1000) // Cap at 1000
      });
    } catch (error) {
      console.error('Failed to fetch high-value transfers - real Envio API required');
      throw new Error('Envio GraphQL API unavailable. Please deploy real indexer.');
    }
  }

  // Query wallet activity for portfolio analysis
  async getWalletActivity(address: string, chainIds: number[] = [1, 137, 42161]): Promise<EnvioQueryResponse<{ Transfer: Transfer[] }>> {
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
    ).slice(0, 10); // Limit to 10 chains
    
    if (validChainIds.length === 0) {
      throw new Error('No valid chain IDs provided');
    }
    
    try {
      return await this.client.request(WALLET_ACTIVITY, { 
        address: address.toLowerCase(), 
        chainIds: validChainIds, 
        limit: 1000 
      });
    } catch (error) {
      console.error('Failed to fetch wallet activity - real Envio API required');
      throw new Error('Envio GraphQL API unavailable. Please deploy real indexer.');
    }
  }

  // Query recent transfers for real-time monitoring
  async getRecentTransfers(minutes: number = 60, chainIds: number[] = [1, 137, 42161]) {
    // Validate minutes
    if (!Number.isInteger(minutes) || minutes <= 0 || minutes > 1440) {
      throw new Error('Minutes must be between 1 and 1440 (24 hours)');
    }
    
    // Validate chain IDs
    if (!Array.isArray(chainIds) || chainIds.length === 0) {
      throw new Error('Valid chain IDs array is required');
    }
    
    const validChainIds = chainIds.filter(id => 
      Number.isInteger(id) && id > 0 && id <= 999999
    ).slice(0, 10); // Limit to 10 chains
    
    if (validChainIds.length === 0) {
      throw new Error('No valid chain IDs provided');
    }
    
    const timestampThreshold = Math.floor(Date.now() / 1000) - (minutes * 60);
    
    try {
      return await this.client.request(RECENT_TRANSFERS, { 
        timestamp: timestampThreshold, 
        chainIds: validChainIds, 
        limit: 500 
      });
    } catch (error) {
      console.error('Failed to fetch recent transfers - real Envio API required');
      throw new Error('Envio GraphQL API unavailable. Please deploy real indexer.');
    }
  }

  // Query gas prices for optimization
  async getGasPrices(chainIds: number[], hours: number = 24) {
    // Validate inputs
    if (!Array.isArray(chainIds) || chainIds.length === 0) {
      throw new Error('Valid chain IDs array is required');
    }
    
    if (!Number.isInteger(hours) || hours <= 0 || hours > 168) {
      throw new Error('Hours must be between 1 and 168 (1 week)');
    }
    
    const validChainIds = chainIds.filter(id => 
      Number.isInteger(id) && id > 0 && id <= 999999
    ).slice(0, 10); // Limit to 10 chains
    
    if (validChainIds.length === 0) {
      throw new Error('No valid chain IDs provided');
    }
    
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

    try {
      return await this.client.request(query, { 
        chainIds: validChainIds, 
        timestamp: timestampThreshold 
      });
    } catch (error) {
      console.error('Failed to fetch gas prices');
      throw new Error('Query failed');
    }
  }

  // Query yield opportunities
  async getYieldOpportunities(chainIds?: number[]) {
    // Validate chain IDs if provided
    let validChainIds: number[] | undefined;
    
    if (chainIds) {
      if (!Array.isArray(chainIds)) {
        throw new Error('Chain IDs must be an array');
      }
      
      validChainIds = chainIds.filter(id => 
        Number.isInteger(id) && id > 0 && id <= 999999
      ).slice(0, 10); // Limit to 10 chains
      
      if (validChainIds.length === 0) {
        validChainIds = undefined;
      }
    }
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

    try {
      return await this.client.request(query, { chainIds: validChainIds });
    } catch (error) {
      console.error('Failed to fetch yield opportunities');
      throw new Error('Query failed');
    }
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
    // Validate address
    if (!address || typeof address !== 'string') {
      throw new Error('Valid address is required');
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid Ethereum address format');
    }
    
    try {
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
    } catch (error) {
      console.error('Failed to get portfolio analytics');
      throw new Error('Analytics query failed');
    }
  }

  private calculateTotalVolume(transfers: any[]): Record<string, number> {
    const volume: Record<string, number> = {};
    
    if (!Array.isArray(transfers)) {
      return volume;
    }
    
    transfers.forEach(transfer => {
      // Validate transfer data
      if (!transfer || typeof transfer !== 'object') return;
      if (!Number.isInteger(transfer.chainId) || transfer.chainId <= 0) return;
      if (typeof transfer.token !== 'string' || !transfer.token) return;
      if (typeof transfer.amount !== 'string') return;
      
      const amount = parseFloat(transfer.amount);
      if (isNaN(amount) || amount < 0) return;
      
      const key = `${transfer.chainId}-${transfer.token.substring(0, 50)}`;
      volume[key] = (volume[key] || 0) + amount;
    });

    return volume;
  }

  private calculateChainDistribution(transfers: any[]): Record<number, number> {
    const distribution: Record<number, number> = {};
    
    if (!Array.isArray(transfers)) {
      return distribution;
    }
    
    transfers.forEach(transfer => {
      // Validate transfer data
      if (!transfer || typeof transfer !== 'object') return;
      if (!Number.isInteger(transfer.chainId) || transfer.chainId <= 0) return;
      
      distribution[transfer.chainId] = (distribution[transfer.chainId] || 0) + 1;
    });

    return distribution;
  }
}

export const envioClient = new EnvioGraphQLClient();