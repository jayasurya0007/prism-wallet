export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  isTestnet: boolean;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TokenBalance {
  address: string;
  symbol: string;
  balance: string;
  decimals: number;
  chainId: number;
  usdValue?: number;
  name?: string;
}

export interface AggregatedBalance {
  token: string;
  symbol: string;
  totalBalance: string;
  totalUsdValue: number;
  balancesByChain: Record<number, TokenBalance>;
}

export interface NexusClient {
  getBalances(address: string, chainIds?: number[]): Promise<TokenBalance[]>;
  getAggregatedBalances(address: string): Promise<AggregatedBalance[]>;
  getSupportedChains(): ChainConfig[];
  getTokenPrice(tokenAddress: string, chainId: number): Promise<number>;
}

export interface BridgeSimulation {
  fromChain: number;
  toChain: number;
  token: string;
  amount: string;
  estimatedFees: string;
  estimatedTime: number;
  route: string[];
}

export interface BridgeIntent {
  id: string;
  simulation: BridgeSimulation;
  status: 'pending' | 'approved' | 'denied' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
}