export type AutomationLevel = 'manual' | 'semi-auto' | 'full-auto';

export interface AutomationConfig {
  level: AutomationLevel;
  maxAmountPerAction: number;
  requireApprovalAbove: number;
  allowedActions: string[];
  enabledChains: number[];
}

export interface PerformanceMetrics {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  totalValue: number;
  avgExecutionTime: number;
  lastActionTime: Date | null;
}

export class AutomationModes {
  private config: AutomationConfig;
  private metrics: PerformanceMetrics;
  
  constructor() {
    this.config = this.getDefaultConfig();
    this.metrics = this.initMetrics();
  }
  
  getConfig(): AutomationConfig {
    return { ...this.config };
  }
  
  setConfig(config: Partial<AutomationConfig>): void {
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid config');
    }
    
    try {
      this.config = { ...this.config, ...config };
      this.saveConfig();
    } catch (error) {
      console.error('Failed to set config:', error);
      throw error;
    }
  }
  
  setLevel(level: AutomationLevel): void {
    const validLevels: AutomationLevel[] = ['manual', 'semi-auto', 'full-auto'];
    
    if (!validLevels.includes(level)) {
      throw new Error('Invalid automation level');
    }
    
    try {
      this.config.level = level;
      this.applyLevelDefaults(level);
      this.saveConfig();
    } catch (error) {
      console.error('Failed to set level:', error);
      throw error;
    }
  }
  
  shouldAutoApprove(action: any): boolean {
    if (!action || typeof action !== 'object') {
      return false;
    }
    
    try {
      if (this.config.level === 'manual') return false;
      if (this.config.level === 'full-auto') return true;
      
      const amount = typeof action.amount === 'number' ? action.amount : 0;
      return amount < this.config.requireApprovalAbove;
    } catch (error) {
      console.error('Auto-approve check failed:', error);
      return false;
    }
  }
  
  isActionAllowed(action: any): boolean {
    if (!action || typeof action !== 'object') {
      return false;
    }
    
    try {
      if (!action.type || !this.config.allowedActions.includes(action.type)) {
        return false;
      }
      
      if (typeof action.chain === 'number' && !this.config.enabledChains.includes(action.chain)) {
        return false;
      }
      
      const amount = typeof action.amount === 'number' ? action.amount : 0;
      if (amount > this.config.maxAmountPerAction) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Action allowed check failed:', error);
      return false;
    }
  }
  
  recordAction(action: any, success: boolean, executionTime: number): void {
    if (!action || typeof action !== 'object') {
      return;
    }
    
    if (typeof success !== 'boolean' || typeof executionTime !== 'number') {
      return;
    }
    
    try {
      this.metrics.totalActions++;
      
      if (success) {
        this.metrics.successfulActions++;
        const amount = typeof action.amount === 'number' ? action.amount : 0;
        this.metrics.totalValue += amount;
      } else {
        this.metrics.failedActions++;
      }
      
      this.metrics.avgExecutionTime = 
        (this.metrics.avgExecutionTime * (this.metrics.totalActions - 1) + executionTime) / 
        this.metrics.totalActions;
      
      this.metrics.lastActionTime = new Date();
      this.saveMetrics();
    } catch (error) {
      console.error('Failed to record action:', error);
    }
  }
  
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  resetMetrics(): void {
    this.metrics = this.initMetrics();
    this.saveMetrics();
  }
  
  private getDefaultConfig(): AutomationConfig {
    return {
      level: 'manual',
      maxAmountPerAction: 1000,
      requireApprovalAbove: 500,
      allowedActions: ['bridge', 'rebalance', 'yield'],
      enabledChains: [1, 10, 137, 42161, 43114, 8453]
    };
  }
  
  private applyLevelDefaults(level: AutomationLevel): void {
    switch (level) {
      case 'manual':
        this.config.requireApprovalAbove = 0;
        break;
      case 'semi-auto':
        this.config.requireApprovalAbove = 500;
        break;
      case 'full-auto':
        this.config.requireApprovalAbove = this.config.maxAmountPerAction;
        break;
    }
  }
  
  private initMetrics(): PerformanceMetrics {
    return {
      totalActions: 0,
      successfulActions: 0,
      failedActions: 0,
      totalValue: 0,
      avgExecutionTime: 0,
      lastActionTime: null
    };
  }
  
  private saveConfig(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agent_config', JSON.stringify(this.config));
    }
  }
  
  private saveMetrics(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agent_metrics', JSON.stringify(this.metrics));
    }
  }
}

export const automationModes = new AutomationModes();
