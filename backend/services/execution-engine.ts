import { AgentDecision } from './ai-agent';

export interface ExecutionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: number;
  actualGain?: number;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedGas: number;
  estimatedTime: number;
  riskAssessment: string;
}

export interface ExecutionStep {
  type: 'approve' | 'bridge' | 'swap' | 'deposit' | 'withdraw';
  description: string;
  chainId: number;
  estimatedGas: number;
  params: Record<string, any>;
}

export class ExecutionEngine {
  private isExecuting = false;
  private executionHistory: Array<{ decision: AgentDecision; result: ExecutionResult; timestamp: Date }> = [];

  async simulateExecution(decision: AgentDecision): Promise<ExecutionPlan> {
    console.log('Simulating execution for decision:', decision);

    const steps: ExecutionStep[] = [];
    let estimatedGas = 0;
    let estimatedTime = 0;

    switch (decision.action) {
      case 'yield':
        steps.push(
          {
            type: 'approve',
            description: `Approve ${decision.targetToken} spending`,
            chainId: decision.targetChain!,
            estimatedGas: 50000,
            params: { token: decision.targetToken, amount: decision.amount }
          },
          {
            type: 'deposit',
            description: `Deposit ${decision.targetToken} to yield protocol`,
            chainId: decision.targetChain!,
            estimatedGas: 150000,
            params: { protocol: 'yield', token: decision.targetToken, amount: decision.amount }
          }
        );
        estimatedGas = 200000;
        estimatedTime = 120; // 2 minutes
        break;

      case 'bridge':
        steps.push(
          {
            type: 'approve',
            description: `Approve ${decision.targetToken} for bridging`,
            chainId: decision.targetChain!,
            estimatedGas: 50000,
            params: { token: decision.targetToken, amount: decision.amount }
          },
          {
            type: 'bridge',
            description: `Bridge ${decision.targetToken} to chain ${decision.targetChain}`,
            chainId: decision.targetChain!,
            estimatedGas: 200000,
            params: { 
              fromChain: 'current', 
              toChain: decision.targetChain, 
              token: decision.targetToken, 
              amount: decision.amount 
            }
          }
        );
        estimatedGas = 250000;
        estimatedTime = 300; // 5 minutes
        break;

      case 'rebalance':
        steps.push(
          {
            type: 'withdraw',
            description: 'Withdraw from over-allocated positions',
            chainId: 1, // Default to Ethereum
            estimatedGas: 120000,
            params: { action: 'withdraw', percentage: 25 }
          },
          {
            type: 'bridge',
            description: 'Bridge assets to target chains',
            chainId: decision.targetChain || 137,
            estimatedGas: 180000,
            params: { action: 'rebalance' }
          },
          {
            type: 'deposit',
            description: 'Deposit to new positions',
            chainId: decision.targetChain || 137,
            estimatedGas: 100000,
            params: { action: 'deposit' }
          }
        );
        estimatedGas = 400000;
        estimatedTime = 600; // 10 minutes
        break;

      default:
        // Hold - no execution needed
        break;
    }

    const riskAssessment = this.assessExecutionRisk(decision, steps);

    return {
      steps,
      estimatedGas,
      estimatedTime,
      riskAssessment
    };
  }

  async executeDecision(decision: AgentDecision): Promise<ExecutionResult> {
    if (this.isExecuting) {
      return {
        success: false,
        error: 'Another execution is already in progress'
      };
    }

    this.isExecuting = true;

    try {
      console.log('Executing decision:', decision);

      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock execution result
      const result: ExecutionResult = {
        success: Math.random() > 0.1, // 90% success rate
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        gasUsed: Math.floor(Math.random() * 200000) + 50000,
        actualGain: decision.estimatedGain * (0.8 + Math.random() * 0.4) // ±20% variance
      };

      if (!result.success) {
        result.error = 'Transaction failed due to insufficient gas or slippage';
      }

      // Record execution
      this.executionHistory.push({
        decision,
        result,
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error'
      };
    } finally {
      this.isExecuting = false;
    }
  }

  private assessExecutionRisk(decision: AgentDecision, steps: ExecutionStep[]): string {
    const factors = [];

    // Risk based on decision type
    if (decision.action === 'bridge') {
      factors.push('Cross-chain bridging involves smart contract risk');
    }
    
    if (decision.riskLevel === 'high') {
      factors.push('High-risk strategy with potential for significant losses');
    }

    // Risk based on gas costs
    const totalGas = steps.reduce((sum, step) => sum + step.estimatedGas, 0);
    if (totalGas > 300000) {
      factors.push('High gas costs may impact profitability');
    }

    // Risk based on confidence
    if (decision.confidence < 0.7) {
      factors.push('Low confidence recommendation - proceed with caution');
    }

    if (factors.length === 0) {
      return 'Low risk execution with standard DeFi protocols';
    }

    return factors.join('. ');
  }

  getExecutionHistory(): Array<{ decision: AgentDecision; result: ExecutionResult; timestamp: Date }> {
    return [...this.executionHistory];
  }

  getSuccessRate(): number {
    if (this.executionHistory.length === 0) return 0;
    const successful = this.executionHistory.filter(h => h.result.success).length;
    return (successful / this.executionHistory.length) * 100;
  }

  getTotalGainsLosses(): { totalGains: number; totalLosses: number } {
    let totalGains = 0;
    let totalLosses = 0;

    for (const history of this.executionHistory) {
      if (history.result.success && history.result.actualGain) {
        if (history.result.actualGain > 0) {
          totalGains += history.result.actualGain;
        } else {
          totalLosses += Math.abs(history.result.actualGain);
        }
      }
    }

    return { totalGains, totalLosses };
  }

  isCurrentlyExecuting(): boolean {
    return this.isExecuting;
  }
}

export const executionEngine = new ExecutionEngine();