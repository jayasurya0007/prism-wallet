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
  id: string;
  fromChain: number;
  toChain: number;
  token: string;
  amount: string;
  estimatedFees: string;
  estimatedTime: number;
  route: string[];
  directCost: string;
  chainAbstractionCost: string;
  recommendedMethod: 'direct' | 'chain-abstraction';
}

export interface BridgeIntent {
  id: string;
  simulation: BridgeSimulation;
  status: 'pending' | 'approved' | 'denied' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  txHash?: string;
  error?: string;
}

export interface AllowanceRequest {
  token: string;
  spender: string;
  amount: string;
  chainId: number;
  type: 'min' | 'max' | 'exact';
}

export interface BridgeProgress {
  intentId: string;
  status: 'simulating' | 'approving' | 'executing' | 'confirming' | 'completed' | 'failed';
  currentStep: number;
  totalSteps: number;
  txHash?: string;
  blockNumber?: number;
  confirmations: number;
  requiredConfirmations: number;
}