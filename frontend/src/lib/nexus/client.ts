import { NexusSDK } from '@avail-project/nexus-core';
import { SUPPORTED_NETWORKS } from '../config/networks';
import type { TokenBalance, AggregatedBalance, ChainConfig } from '../../types/nexus';

export class NexusClient {
  private sdk: NexusSDK;
  private supportedChains: number[];

  constructor() {
    this.sdk = new NexusSDK({
      endpoint: process.env.NEXT_PUBLIC_AVAIL_NEXUS_ENDPOINT || 'https://api.nexus.avail.so',
      chains: [1, 10, 137, 42161, 43114, 8453]
    });
    this.supportedChains = [1, 10, 137, 42161, 43114, 8453];
  }

  async initialize() {
    // Set EVM provider before initialization
    if (typeof window !== 'undefined' && window.ethereum) {
      this.sdk.setEVMProvider(window.ethereum);
    } else {
      // Use a default RPC provider for server-side or when no wallet is connected
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
      this.sdk.setEVMProvider(provider);
    }
    
    await this.sdk.initialize();
    console.log('Nexus SDK initialized for chains:', this.supportedChains);
  }

  async getBalances(address: string, chainIds?: number[]): Promise<TokenBalance[]> {
    // Validate address format
    if (!address || typeof address !== 'string') {
      throw new Error('Valid address is required');
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid Ethereum address format');
    }

    // Validate chain IDs
    if (chainIds) {
      if (!Array.isArray(chainIds)) {
        throw new Error('Chain IDs must be an array');
      }
      
      for (const chainId of chainIds) {
        if (!Number.isInteger(chainId) || chainId <= 0) {
          throw new Error('Invalid chain ID');
        }
      }
    }

    const chains = chainIds || this.supportedChains;
    
    try {
      // Ensure SDK is properly initialized with EVM provider
      await this.initialize();
      
      // Get unified balances across chains using official SDK
      const balances: TokenBalance[] = [];
      
      for (const chainId of chains) {
        const chainBalances = await this.getChainBalances(address, chainId);
        balances.push(...chainBalances);
      }
      
      return balances;
    } catch (error) {
      console.error('Failed to fetch balances from Avail Nexus API:', error);
      throw new Error('Avail Nexus API unavailable. Please check network connection.');
    }
  }

  async getAggregatedBalances(address: string): Promise<AggregatedBalance[]> {
    // Validation is handled by getBalances
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
    const tokens = this.getTokenAddresses(chainId);
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
      // Use Avail Nexus SDK to get native token balance
      const balance = await this.sdk.getBalance({
        address,
        chainId,
        token: 'native'
      });
      
      return {
        address: '0x0000000000000000000000000000000000000000',
        symbol: network.nativeCurrency.symbol,
        balance: balance.amount,
        decimals: network.nativeCurrency.decimals,
        chainId,
        usdValue: balance.usdValue || 0,
        name: network.nativeCurrency.name
      };
    } catch (error) {
      console.error(`Failed to get native balance for ${address} on chain ${chainId}:`, error);
      throw error;
    }
  }

  private async getTokenBalance(address: string, tokenAddress: string, symbol: string, chainId: number): Promise<TokenBalance | null> {
    try {
      // Use Avail Nexus SDK to get token balance
      const balance = await this.sdk.getBalance({
        address,
        chainId,
        token: tokenAddress
      });
      
      return {
        address: tokenAddress,
        symbol,
        balance: balance.amount,
        decimals: balance.decimals,
        chainId,
        usdValue: balance.usdValue || 0,
        name: balance.name
      };
    } catch (error) {
      console.error(`Failed to get ${symbol} balance for ${address} on chain ${chainId}:`, error);
      throw error;
    }
  }

  async getTokenPrice(tokenAddress: string, chainId: number): Promise<number> {
    // Placeholder for price fetching
    return 0;
  }

  async estimateBridgeCost(fromChain: number, toChain: number, token: string, amount: string): Promise<{
    directCost: string;
    chainAbstractionCost: string;
    recommendedMethod: 'direct' | 'chain-abstraction';
  }> {
    // Validate inputs
    if (!Number.isInteger(fromChain) || !Number.isInteger(toChain)) {
      throw new Error('Chain IDs must be integers');
    }
    
    if (!token || typeof token !== 'string') {
      throw new Error('Token is required');
    }
    
    if (!/^(0x[a-fA-F0-9]{40}|[A-Z]{3,5})$/.test(token)) {
      throw new Error('Invalid token format');
    }
    
    if (!amount || typeof amount !== 'string') {
      throw new Error('Amount is required');
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    try {
      const estimate = await this.sdk.estimateBridge({
        fromChain,
        toChain,
        token,
        amount
      });
      
      return {
        directCost: estimate.directFee,
        chainAbstractionCost: estimate.chainAbstractionFee,
        recommendedMethod: estimate.recommendedMethod
      };
    } catch (error) {
      console.error('Bridge estimation failed');
      // Fallback to mock data with validated amount
      const baseAmount = parseFloat(amount);
      if (isNaN(baseAmount) || baseAmount <= 0) {
        throw new Error('Invalid amount for estimation');
      }
      const directFee = baseAmount * 0.003;
      const chainAbstractionFee = baseAmount * 0.005;
      
      return {
        directCost: directFee.toString(),
        chainAbstractionCost: chainAbstractionFee.toString(),
        recommendedMethod: directFee < chainAbstractionFee ? 'direct' : 'chain-abstraction'
      };
    }
  }

  async checkBridgeSupport(fromChain: number, toChain: number, token: string): Promise<boolean> {
    // Check if bridge is supported between chains for specific token
    const supportedPairs = [
      [1, 137], [1, 42161], [1, 10], [1, 8453], // Ethereum to L2s
      [137, 42161], [137, 10], [137, 8453], // Polygon to L2s
      [42161, 10], [42161, 8453], // Arbitrum to other L2s
      [10, 8453] // Optimism to Base
    ];
    
    return supportedPairs.some(([from, to]) => 
      (from === fromChain && to === toChain) || (from === toChain && to === fromChain)
    );
  }

  private getTokenAddresses(chainId: number): Record<string, string> {
    const tokenMap: Record<number, Record<string, string>> = {
      1: {
        'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      },
      137: {
        'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
      }
    };
    return tokenMap[chainId] || {};
  }
}

export const nexusClient = new NexusClient();