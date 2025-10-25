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
    this.policies.set(pkpPublicKey, policy);
  }

  getPolicy(pkpPublicKey: string): SigningPolicy | null {
    return this.policies.get(pkpPublicKey) || null;
  }

  validateTransaction(pkpPublicKey: string, txData: TransactionData): PolicyValidationResult {
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
    if (txData.amount !== undefined && txData.amount > policy.maxAmount) {
      result.isValid = false;
      result.errors.push(`Amount ${txData.amount} exceeds limit of ${policy.maxAmount}`);
    }

    // Validate chain allowlist
    if (txData.chainId !== undefined && !policy.allowedChains.includes(txData.chainId)) {
      result.isValid = false;
      result.errors.push(`Chain ${txData.chainId} not allowed. Allowed chains: ${policy.allowedChains.join(', ')}`);
    }

    // Validate gas price
    if (txData.gasPrice !== undefined) {
      const gasPriceGwei = txData.gasPrice / 1e9;
      if (gasPriceGwei > policy.requireGasBelow) {
        result.isValid = false;
        result.errors.push(`Gas price ${gasPriceGwei.toFixed(2)} Gwei exceeds limit of ${policy.requireGasBelow} Gwei`);
      }
    }

    // Validate token allowlist
    if (txData.token && !policy.allowedTokens.includes(txData.token)) {
      result.isValid = false;
      result.errors.push(`Token ${txData.token} not allowed. Allowed tokens: ${policy.allowedTokens.join(', ')}`);
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