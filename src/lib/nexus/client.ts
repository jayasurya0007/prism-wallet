import { getSupportedChainsFromEnv } from '../utils/env';
import { SUPPORTED_NETWORKS } from '../config/networks';
import { TOKEN_ADDRESSES } from '../config/envio';
import type { TokenBalance, AggregatedBalance, ChainConfig } from '../../types/nexus';
import axios from 'axios';

export class NexusClient {
  private apiEndpoint: string;
  private supportedChains: number[];

  constructor() {
    this.apiEndpoint = process.env.AVAIL_NEXUS_ENDPOINT || '';
    this.supportedChains = getSupportedChainsFromEnv();
  }

  async initialize() {
    console.log('Nexus client initialized for chains:', this.supportedChains);
  }

  async getBalances(address: string, chainIds?: number[]): Promise<TokenBalance[]> {
    const chains = chainIds || this.supportedChains;
    const balances: TokenBalance[] = [];

    for (const chainId of chains) {
      try {
        const chainBalances = await this.getChainBalances(address, chainId);
        balances.push(...chainBalances);
      } catch (error) {
        console.error(`Failed to fetch balances for chain ${chainId}:`, error);
      }
    }

    return balances;
  }

  async getAggregatedBalances(address: string): Promise<AggregatedBalance[]> {
    const balances = await this.getBalances(address);
    const aggregated = new Map<string, AggregatedBalance>();

    for (const balance of balances) {
      const key = balance.symbol;
      if (!aggregated.has(key)) {
        aggregated.set(key, {
          token: balance.address,
          symbol: balance.symbol,
          totalBalance: '0',
          totalUsdValue: 0,
          balancesByChain: {}
        });
      }

      const agg = aggregated.get(key)!;
      agg.balancesByChain[balance.chainId] = balance;
      agg.totalBalance = (BigInt(agg.totalBalance) + BigInt(balance.balance)).toString();
      agg.totalUsdValue += balance.usdValue || 0;
    }

    return Array.from(aggregated.values());
  }

  getSupportedChains(): ChainConfig[] {
    return this.supportedChains.map(id => SUPPORTED_NETWORKS[id]).filter(Boolean);
  }

  private async getChainBalances(address: string, chainId: number): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = [];
    const network = SUPPORTED_NETWORKS[chainId];
    
    if (!network) return balances;

    // Get native token balance
    const nativeBalance = await this.getNativeBalance(address, chainId);
    if (nativeBalance) balances.push(nativeBalance);

    // Get token balances
    const tokens = TOKEN_ADDRESSES[chainId] || {};
    for (const [symbol, tokenAddress] of Object.entries(tokens)) {
      const tokenBalance = await this.getTokenBalance(address, tokenAddress, symbol, chainId);
      if (tokenBalance) balances.push(tokenBalance);
    }

    return balances;
  }

  private async getNativeBalance(address: string, chainId: number): Promise<TokenBalance | null> {
    const network = SUPPORTED_NETWORKS[chainId];
    if (!network) return null;

    try {
      // Placeholder for actual RPC call
      return {
        address: '0x0000000000000000000000000000000000000000',
        symbol: network.nativeCurrency.symbol,
        balance: '0',
        decimals: network.nativeCurrency.decimals,
        chainId,
        usdValue: 0,
        name: network.nativeCurrency.name
      };
    } catch (error) {
      console.error(`Failed to get native balance for ${address} on chain ${chainId}:`, error);
      return null;
    }
  }

  private async getTokenBalance(address: string, tokenAddress: string, symbol: string, chainId: number): Promise<TokenBalance | null> {
    try {
      // Placeholder for actual token balance call
      return {
        address: tokenAddress,
        symbol,
        balance: '0',
        decimals: symbol === 'USDC' ? 6 : 18,
        chainId,
        usdValue: 0
      };
    } catch (error) {
      console.error(`Failed to get ${symbol} balance for ${address} on chain ${chainId}:`, error);
      return null;
    }
  }

  async getTokenPrice(tokenAddress: string, chainId: number): Promise<number> {
    // Placeholder for price fetching
    return 0;
  }
}

export const nexusClient = new NexusClient();