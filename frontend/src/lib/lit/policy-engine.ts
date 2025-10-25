import { SigningPolicy } from '../../types/lit';

export interface TransactionData {
  amount?: number;
  chainId?: number;
  gasPrice?: number;
  token?: string;
  to?: string;
  value?: string;
  data?: string;
  lastSigningTime?: number;
}

export interface PolicyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class PolicyEngine {
  private policies: Map<string, SigningPolicy> = new Map();

  setPolicy(pkpPublicKey: string, policy: SigningPolicy): void {
    // Validate PKP public key
    if (!pkpPublicKey || typeof pkpPublicKey !== 'string') {
      throw new Error('Valid PKP public key is required');
    }
    
    if (!/^0x[a-fA-F0-9]{130}$/.test(pkpPublicKey)) {
      throw new Error('Invalid PKP public key format');
    }
    
    // Validate policy structure
    if (!policy || typeof policy !== 'object') {
      throw new Error('Valid policy object is required');
    }
    
    // Validate policy fields
    if (typeof policy.maxAmount !== 'number' || policy.maxAmount < 0) {
      throw new Error('maxAmount must be a non-negative number');
    }
    
    if (!Array.isArray(policy.allowedChains) || policy.allowedChains.length === 0) {
      throw new Error('allowedChains must be a non-empty array');
    }
    
    if (!Array.isArray(policy.allowedTokens) || policy.allowedTokens.length === 0) {
      throw new Error('allowedTokens must be a non-empty array');
    }
    
    if (typeof policy.requireGasBelow !== 'number' || policy.requireGasBelow <= 0) {
      throw new Error('requireGasBelow must be a positive number');
    }
    
    if (typeof policy.cooldownPeriod !== 'number' || policy.cooldownPeriod < 0) {
      throw new Error('cooldownPeriod must be a non-negative number');
    }
    
    this.policies.set(pkpPublicKey, policy);
  }

  getPolicy(pkpPublicKey: string): SigningPolicy | null {
    // Validate PKP public key
    if (!pkpPublicKey || typeof pkpPublicKey !== 'string') {
      return null;
    }
    
    if (!/^0x[a-fA-F0-9]{130}$/.test(pkpPublicKey)) {
      return null;
    }
    
    return this.policies.get(pkpPublicKey) || null;
  }

  validateTransaction(pkpPublicKey: string, txData: TransactionData): PolicyValidationResult {
    // Validate inputs
    if (!pkpPublicKey || typeof pkpPublicKey !== 'string') {
      return {
        isValid: false,
        errors: ['Invalid PKP public key'],
        warnings: []
      };
    }
    
    if (!txData || typeof txData !== 'object') {
      return {
        isValid: false,
        errors: ['Invalid transaction data'],
        warnings: []
      };
    }
    
    const policy = this.getPolicy(pkpPublicKey);
    const result: PolicyValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!policy) {
      result.isValid = false;
      result.errors.push('No policy found for PKP');
      return result;
    }

    // Validate amount limit
    if (txData.amount !== undefined) {
      if (typeof txData.amount !== 'number' || isNaN(txData.amount) || txData.amount < 0) {
        result.isValid = false;
        result.errors.push('Invalid amount value');
      } else if (txData.amount > policy.maxAmount) {
        result.isValid = false;
        result.errors.push('Amount exceeds policy limit');
      }
    }

    // Validate chain allowlist
    if (txData.chainId !== undefined) {
      if (typeof txData.chainId !== 'number' || !Number.isInteger(txData.chainId) || txData.chainId <= 0) {
        result.isValid = false;
        result.errors.push('Invalid chain ID');
      } else if (!policy.allowedChains.includes(txData.chainId)) {
        result.isValid = false;
        result.errors.push('Chain not allowed by policy');
      }
    }

    // Validate gas price
    if (txData.gasPrice !== undefined) {
      if (typeof txData.gasPrice !== 'number' || isNaN(txData.gasPrice) || txData.gasPrice < 0) {
        result.isValid = false;
        result.errors.push('Invalid gas price value');
      } else {
        const gasPriceGwei = txData.gasPrice / 1e9;
        if (gasPriceGwei > policy.requireGasBelow) {
          result.isValid = false;
          result.errors.push('Gas price exceeds policy limit');
        }
      }
    }

    // Validate token allowlist
    if (txData.token) {
      if (typeof txData.token !== 'string') {
        result.isValid = false;
        result.errors.push('Invalid token format');
      } else if (!policy.allowedTokens.includes(txData.token)) {
        result.isValid = false;
        result.errors.push('Token not allowed by policy');
      }
    }

    // Validate cooldown period
    if (txData.lastSigningTime) {
      const now = Math.floor(Date.now() / 1000);
      const timeSinceLastSigning = now - txData.lastSigningTime;
      
      if (timeSinceLastSigning < policy.cooldownPeriod) {
        const remainingCooldown = policy.cooldownPeriod - timeSinceLastSigning;
        result.isValid = false;
        result.errors.push(`Cooldown period active. Wait ${remainingCooldown} seconds`);
      }
    }

    // Add warnings for borderline cases
    if (txData.amount !== undefined && txData.amount > policy.maxAmount * 0.8) {
      result.warnings.push(`Amount ${txData.amount} is close to limit of ${policy.maxAmount}`);
    }

    if (txData.gasPrice !== undefined) {
      const gasPriceGwei = txData.gasPrice / 1e9;
      if (gasPriceGwei > policy.requireGasBelow * 0.8) {
        result.warnings.push(`Gas price ${gasPriceGwei.toFixed(2)} Gwei is close to limit of ${policy.requireGasBelow} Gwei`);
      }
    }

    return result;
  }

  createDefaultPolicy(): SigningPolicy {
    return {
      maxAmount: 100,
      allowedChains: [1, 10, 137, 42161, 43114, 8453],
      requireGasBelow: 200,
      allowedTokens: ['USDC', 'USDT', 'ETH'],
      cooldownPeriod: 300
    };
  }

  updatePolicy(pkpPublicKey: string, updates: Partial<SigningPolicy>): boolean {
    const existingPolicy = this.getPolicy(pkpPublicKey);
    if (!existingPolicy) {
      return false;
    }

    const updatedPolicy = { ...existingPolicy, ...updates };
    this.setPolicy(pkpPublicKey, updatedPolicy);
    return true;
  }

  getAllPolicies(): Array<{ pkpPublicKey: string; policy: SigningPolicy }> {
    return Array.from(this.policies.entries()).map(([pkpPublicKey, policy]) => ({
      pkpPublicKey,
      policy
    }));
  }

  removePolicy(pkpPublicKey: string): boolean {
    return this.policies.delete(pkpPublicKey);
  }
}

export const policyEngine = new PolicyEngine();