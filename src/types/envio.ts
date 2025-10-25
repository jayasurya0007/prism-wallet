export interface Transfer {
  id: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  chainId: number;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}

export interface YieldOpportunity {
  protocol: string;
  token: string;
  apy: number;
  tvl: string;
  chainId: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface GasPrice {
  chainId: number;
  gasPrice: string;
  timestamp: number;
}

export interface PortfolioAnalytics {
  totalValue: number;
  chainDistribution: Record<number, number>;
  tokenDistribution: Record<string, number>;
  yieldEarnings: number;
}