// Envio HyperIndex Types
// Reference: https://docs.envio.dev/docs/HyperIndex/overview

export interface Transfer {
  id: string;
  chainId: number;
  token: string;
  from: string;
  to: string;
  amount: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  logIndex: number;
}

export interface HighValueTransfer {
  id: string;
  chainId: number;
  token: string;
  from: string;
  to: string;
  amount: string;
  usdValue: number;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  flagged: boolean;
}

export interface Approval {
  id: string;
  chainId: number;
  token: string;
  owner: string;
  spender: string;
  amount: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

export interface WalletActivity {
  id: string;
  address: string;
  chainId: number;
  token: string;
  totalTransfers: number;
  totalVolume: string;
  lastActivity: number;
  firstActivity: number;
}

export interface GasPrice {
  id: string;
  chainId: number;
  gasPrice: string;
  blockNumber: number;
  timestamp: number;
}

export interface YieldOpportunity {
  id: string;
  protocol: string;
  chainId: number;
  token: string;
  apy: number;
  tvl: string;
  timestamp: number;
  active: boolean;
}

export interface EnvioQueryResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

export interface PortfolioAnalytics {
  totalTransactions: number;
  totalVolume: Record<string, number>;
  chainDistribution: Record<number, number>;
  recentActivity: Transfer[];
  highValueActivity: HighValueTransfer[];
}