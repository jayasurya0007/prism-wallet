export interface AgentConfig {
  automationLevel: 'manual' | 'semi-auto' | 'full-auto';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  maxTransactionAmount: number;
  enabledStrategies: string[];
}

export interface AgentAction {
  id: string;
  type: 'bridge' | 'yield' | 'rebalance' | 'gas-optimization';
  description: string;
  estimatedGain: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface AgentStatus {
  isActive: boolean;
  lastAction: Date;
  totalActions: number;
  successRate: number;
  totalGains: number;
}