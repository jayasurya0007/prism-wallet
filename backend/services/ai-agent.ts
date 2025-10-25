`export interface AgentDecision {
  action: 'bridge' | 'yield' | 'rebalance' | 'hold';
  confidence: number;
  reasoning: string;
  estimatedGain: number;
}

export class AIAgent {
  private isActive = false;

  start() {
    this.isActive = true;
    console.log('AI Agent started');
  }

  stop() {
    this.isActive = false;
    console.log('AI Agent stopped');
  }

  async analyze(portfolioData: any): Promise<AgentDecision> {
    if (!this.isActive) {
      return {
        action: 'hold',
        confidence: 0,
        reasoning: 'Agent inactive',
        estimatedGain: 0
      };
    }

    // Simple decision logic
    return {
      action: 'hold',
      confidence: 0.8,
      reasoning: 'Portfolio balanced, no action needed',
      estimatedGain: 0
    };
  }

  getStatus() {
    return {
      active: this.isActive,
      lastAction: new Date(),
      totalActions: 0
    };
  }
}

export const aiAgent = new AIAgent();