import { policyEngine } from '../lit/policy-engine';
import { riskAssessor } from '../ai/risk-assessor';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ActionValidator {
  async validate(action: any, context: any): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!action || typeof action !== 'object') {
      return { valid: false, errors: ['Invalid action object'], warnings: [] };
    }
    
    if (!context || typeof context !== 'object') {
      warnings.push('Invalid context provided');
    }
    
    if (!action.type || typeof action.type !== 'string') {
      errors.push('Action type is required');
    }
    
    if (typeof action.amount !== 'number' || action.amount <= 0) {
      errors.push('Valid amount is required');
    }
    
    try {
      const policyCheck = await policyEngine.validateAction(action);
      if (policyCheck && !policyCheck.allowed) {
        errors.push(`Policy violation: ${policyCheck.reason || 'Unknown'}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Policy validation failed: ${errorMsg}`);
      console.error('Policy validation error:', error);
    }
    
    try {
      const risk = await riskAssessor.assessAction(action, context);
      if (risk && risk.level === 'critical') {
        errors.push('Critical risk level detected');
      } else if (risk && risk.level === 'high') {
        warnings.push('High risk level - proceed with caution');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      warnings.push(`Risk assessment unavailable: ${errorMsg}`);
      console.error('Risk assessment error:', error);
    }
    
    const supportedChains = [1, 10, 137, 42161, 43114, 8453];
    if (typeof action.chain === 'number' && !supportedChains.includes(action.chain)) {
      errors.push(`Unsupported chain: ${action.chain}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  async validateBatch(actions: any[], context: any): Promise<ValidationResult[]> {
    if (!Array.isArray(actions)) {
      return [{ valid: false, errors: ['Invalid actions array'], warnings: [] }];
    }
    
    try {
      return await Promise.all(actions.map(action => this.validate(action, context)));
    } catch (error) {
      console.error('Batch validation failed:', error);
      return [{ valid: false, errors: ['Batch validation failed'], warnings: [] }];
    }
  }
}

export const actionValidator = new ActionValidator();
