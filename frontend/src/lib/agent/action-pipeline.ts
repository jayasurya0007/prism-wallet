import { decisionEngine } from '../ai/decision-engine';
import { riskAssessor } from '../ai/risk-assessor';
import { policyEngine } from '../lit/policy-engine';
import { autonomousSigner } from '../lit/autonomous-signer';
import { nexusClient } from '../nexus/client';
import { portfolioAnalytics } from '../envio/portfolio-analytics';
import { gasTracker } from '../envio/gas-tracker';

export interface PipelineContext {
  address: string;
  riskTolerance: 'low' | 'medium' | 'high';
  autoApprove: boolean;
}

export interface PipelineResult {
  success: boolean;
  action?: any;
  decision?: any;
  risk?: any;
  txHash?: string;
  error?: string;
}

export class ActionPipeline {
  async execute(context: PipelineContext): Promise<PipelineResult> {
    if (!context?.address || typeof context.address !== 'string') {
      return { success: false, error: 'Invalid context: address required' };
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(context.address)) {
      return { success: false, error: 'Invalid Ethereum address format' };
    }
    
    try {
      console.log('[Pipeline] Step 1: Gathering data from Envio...');
      const analytics = await portfolioAnalytics.getAnalytics(context.address);
      const gasPrices = await gasTracker.getGasPrices();
      
      if (!analytics || !gasPrices) {
        throw new Error('Failed to fetch required data');
      }
      
      // Step 2: AI Agent - Analyze and generate recommendation
      console.log('[Pipeline] Step 2: AI analysis...');
      const decision = await decisionEngine.analyzePortfolio(context.address, {
        portfolioValue: analytics.totalValue,
        gasPrice: gasPrices[1] || 50,
        yieldOpportunities: [],
        riskTolerance: context.riskTolerance
      });
      
      if (decision.action === 'hold') {
        return { success: true, decision, action: null };
      }
      
      // Step 3: Risk Assessment
      console.log('[Pipeline] Step 3: Risk assessment...');
      const risk = await riskAssessor.assessAction(decision.params, {
        address: context.address,
        portfolioValue: analytics.totalValue
      });
      
      if (risk.level === 'critical') {
        return { 
          success: false, 
          decision, 
          risk,
          error: 'Action blocked: Critical risk level'
        };
      }
      
      // Step 4: Lit Protocol - Validate against policy
      console.log('[Pipeline] Step 4: Policy validation...');
      const policyCheck = await policyEngine.validateAction({
        type: decision.action,
        amount: decision.params?.amount || 0,
        chain: decision.params?.chain || 1
      });
      
      if (!policyCheck.allowed) {
        return {
          success: false,
          decision,
          risk,
          error: `Policy violation: ${policyCheck.reason}`
        };
      }
      
      // Step 5: Execute if auto-approved or low risk
      if (context.autoApprove || risk.level === 'low') {
        console.log('[Pipeline] Step 5: Executing action...');
        
        try {
          const txHash = await this.executeAction(decision, context.address);
          
          return {
            success: true,
            action: decision.action,
            decision,
            risk,
            txHash
          };
        } catch (execError) {
          return {
            success: false,
            decision,
            risk,
            error: `Execution failed: ${execError instanceof Error ? execError.message : 'Unknown error'}`
          };
        }
      }
      
      return {
        success: true,
        decision,
        risk,
        action: 'pending_approval'
      };
      
    } catch (error) {
      console.error('[Pipeline] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pipeline execution failed'
      };
    }
  }
  
  private async executeAction(decision: any, address: string): Promise<string> {
    const allowedActions = ['bridge', 'rebalance'];
    
    if (!decision?.action || !allowedActions.includes(decision.action)) {
      throw new Error('Action not allowed');
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid address');
    }
    
    try {
      switch (decision.action) {
        case 'bridge':
          return await this.executeBridge(decision.params);
        case 'rebalance':
          return await this.executeRebalance(decision.params, address);
        default:
          throw new Error('Invalid action');
      }
    } catch (error) {
      throw new Error(`Action execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeBridge(params: any): Promise<string> {
    if (!params?.fromChain || !params?.toChain || !params?.token || !params?.amount) {
      throw new Error('Invalid bridge parameters');
    }
    
    const fromChain = Number(params.fromChain);
    const toChain = Number(params.toChain);
    
    if (!Number.isInteger(fromChain) || !Number.isInteger(toChain)) {
      throw new Error('Invalid chain IDs');
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(String(params.token))) {
      throw new Error('Invalid token address');
    }
    
    try {
      const result = await nexusClient.getClient().bridge({
        fromChain,
        toChain,
        token: String(params.token),
        amount: String(params.amount)
      });
      
      return result.txHash || 'pending';
    } catch (error) {
      throw new Error(`Bridge failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeRebalance(params: any, address: string): Promise<string> {
    if (!params?.targetDistribution || !Array.isArray(params.targetDistribution)) {
      throw new Error('Invalid rebalance parameters');
    }
    
    try {
      const operations = params.targetDistribution.map((target: any) => {
        if (typeof target.chain !== 'number' || typeof target.target !== 'number' || typeof target.current !== 'number') {
          throw new Error('Invalid target distribution format');
        }
        
        return {
          chain: target.chain,
          amount: target.target - target.current
        };
      });
      
      return 'rebalance_initiated';
    } catch (error) {
      throw new Error(`Rebalance failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const actionPipeline = new ActionPipeline();
