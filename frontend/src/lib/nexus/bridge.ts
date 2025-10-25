import { NexusSDK } from '@avail-project/nexus-core';
import { BridgeSimulation, BridgeIntent, AllowanceRequest, BridgeProgress } from '../../types/nexus';
import { SUPPORTED_NETWORKS } from '../config/networks';

export interface BridgeParams {
  fromChain: number;
  toChain: number;
  token: string;
  amount: string;
  recipient?: string;
}

export interface BridgeHooks {
  onIntent?: (intent: BridgeIntent, allow: () => void, deny: () => void, refresh: () => void) => void;
  onAllowance?: (request: AllowanceRequest, allow: (type: 'min' | 'max' | 'exact') => void, deny: () => void) => void;
  onProgress?: (progress: BridgeProgress) => void;
}

export class NexusBridge {
  private sdk: NexusSDK;
  private intents: Map<string, BridgeIntent> = new Map();
  private hooks: BridgeHooks = {};
  private progressTrackers: Map<string, BridgeProgress> = new Map();

  constructor() {
    this.sdk = new NexusSDK({
      endpoint: process.env.NEXT_PUBLIC_AVAIL_NEXUS_ENDPOINT || 'https://api.nexus.avail.so',
      chains: [1, 10, 137, 42161, 43114, 8453]
    });
  }

  setHooks(hooks: BridgeHooks) {
    this.hooks = hooks;
  }

  async simulateBridge(params: BridgeParams): Promise<BridgeSimulation> {
    const { fromChain, toChain, token, amount } = params;
    
    // Validate chains
    if (!SUPPORTED_NETWORKS[fromChain] || !SUPPORTED_NETWORKS[toChain]) {
      throw new Error('Unsupported chain');
    }

    try {
      // Use official Nexus SDK simulation
      const simulation = await this.sdk.simulateBridge({
        fromChain,
        toChain,
        token,
        amount,
        recipient: params.recipient
      });
      
      return {
        id: simulation.id,
        fromChain,
        toChain,
        token,
        amount,
        estimatedFees: simulation.estimatedFees,
        estimatedTime: simulation.estimatedTime,
        route: simulation.route,
        directCost: simulation.directCost,
        chainAbstractionCost: simulation.chainAbstractionCost,
        recommendedMethod: simulation.recommendedMethod
      };
    } catch (error) {
      console.error('Nexus bridge simulation failed:', error);
      // Fallback to mock simulation
      const baseAmount = parseFloat(amount);
      const directFee = baseAmount * 0.003;
      const chainAbstractionFee = baseAmount * 0.005;
      
      return {
        id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromChain,
        toChain,
        token,
        amount,
        estimatedFees: directFee.toString(),
        estimatedTime: this.getEstimatedTime(fromChain, toChain),
        route: this.getOptimalRoute(fromChain, toChain),
        directCost: directFee.toString(),
        chainAbstractionCost: chainAbstractionFee.toString(),
        recommendedMethod: directFee < chainAbstractionFee ? 'direct' : 'chain-abstraction'
      };
    }
  }

  async createIntent(simulation: BridgeSimulation): Promise<string> {
    const intent: BridgeIntent = {
      id: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      simulation,
      status: 'pending',
      createdAt: new Date()
    };

    this.intents.set(intent.id, intent);

    // Trigger intent hook for user approval
    if (this.hooks.onIntent) {
      return new Promise((resolve, reject) => {
        this.hooks.onIntent!(
          intent,
          () => {
            intent.status = 'approved';
            intent.approvedAt = new Date();
            resolve(intent.id);
          },
          () => {
            intent.status = 'denied';
            reject(new Error('Intent denied by user'));
          },
          () => {
            // Refresh simulation
            this.simulateBridge({
              fromChain: simulation.fromChain,
              toChain: simulation.toChain,
              token: simulation.token,
              amount: simulation.amount
            }).then(newSim => {
              intent.simulation = newSim;
            });
          }
        );
      });
    }

    // Auto-approve if no hook
    intent.status = 'approved';
    intent.approvedAt = new Date();
    return intent.id;
  }

  async executeBridge(intentId: string): Promise<string> {
    const intent = this.intents.get(intentId);
    if (!intent) {
      throw new Error('Intent not found');
    }

    if (intent.status !== 'approved') {
      throw new Error('Intent not approved');
    }

    intent.status = 'executing';

    // Initialize progress tracking
    const progress: BridgeProgress = {
      intentId,
      status: 'simulating',
      currentStep: 1,
      totalSteps: 4,
      confirmations: 0,
      requiredConfirmations: 12
    };

    this.progressTrackers.set(intentId, progress);
    this.notifyProgress(progress);

    try {
      // Step 1: Check allowance
      await this.handleAllowance(intent);
      progress.status = 'approving';
      progress.currentStep = 2;
      this.notifyProgress(progress);

      // Step 2: Execute bridge transaction
      const txHash = await this.executeBridgeTransaction(intent);
      intent.txHash = txHash;
      progress.txHash = txHash;
      progress.status = 'executing';
      progress.currentStep = 3;
      this.notifyProgress(progress);

      // Step 3: Wait for confirmations
      await this.waitForConfirmations(progress);
      progress.status = 'confirming';
      progress.currentStep = 4;
      this.notifyProgress(progress);

      // Step 4: Complete
      intent.status = 'completed';
      intent.completedAt = new Date();
      progress.status = 'completed';
      this.notifyProgress(progress);

      return txHash;
    } catch (error) {
      intent.status = 'failed';
      intent.error = error instanceof Error ? error.message : 'Unknown error';
      progress.status = 'failed';
      this.notifyProgress(progress);
      throw error;
    }
  }

  private async handleAllowance(intent: BridgeIntent): Promise<void> {
    const { token, amount, fromChain } = intent.simulation;
    
    const allowanceRequest: AllowanceRequest = {
      token,
      spender: '0x...', // Bridge contract address
      amount,
      chainId: fromChain,
      type: 'min'
    };

    if (this.hooks.onAllowance) {
      return new Promise((resolve, reject) => {
        this.hooks.onAllowance!(
          allowanceRequest,
          (type) => {
            allowanceRequest.type = type;
            resolve();
          },
          () => reject(new Error('Allowance denied'))
        );
      });
    }
  }

  private async executeBridgeTransaction(intent: BridgeIntent): Promise<string> {
    // Mock transaction execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  private async waitForConfirmations(progress: BridgeProgress): Promise<void> {
    const requiredConfirmations = progress.requiredConfirmations;
    
    for (let i = 0; i <= requiredConfirmations; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      progress.confirmations = i;
      progress.blockNumber = 18000000 + i;
      this.notifyProgress(progress);
    }
  }

  private notifyProgress(progress: BridgeProgress): void {
    this.progressTrackers.set(progress.intentId, progress);
    if (this.hooks.onProgress) {
      this.hooks.onProgress(progress);
    }
  }

  private getEstimatedTime(fromChain: number, toChain: number): number {
    // Base time in seconds
    const baseTime = 300; // 5 minutes
    
    // Add time based on chain characteristics
    const fromNetwork = SUPPORTED_NETWORKS[fromChain];
    const toNetwork = SUPPORTED_NETWORKS[toChain];
    
    let additionalTime = 0;
    
    // Ethereum mainnet takes longer
    if (fromChain === 1 || toChain === 1) {
      additionalTime += 180; // 3 minutes
    }
    
    // Cross-ecosystem bridges take longer
    if (this.isDifferentEcosystem(fromChain, toChain)) {
      additionalTime += 300; // 5 minutes
    }
    
    return baseTime + additionalTime;
  }

  private getOptimalRoute(fromChain: number, toChain: number): string[] {
    // Direct route for same ecosystem
    if (!this.isDifferentEcosystem(fromChain, toChain)) {
      return [fromChain.toString(), toChain.toString()];
    }
    
    // Route through Ethereum for cross-ecosystem
    if (fromChain !== 1 && toChain !== 1) {
      return [fromChain.toString(), '1', toChain.toString()];
    }
    
    return [fromChain.toString(), toChain.toString()];
  }

  private isDifferentEcosystem(chainA: number, chainB: number): boolean {
    const ethereumEcosystem = [1, 10, 42161, 8453, 11155111, 11155420, 421614, 84532];
    const polygonEcosystem = [137, 80002];
    const avalancheEcosystem = [43114];
    const bnbEcosystem = [56];
    
    const isAInEthereum = ethereumEcosystem.includes(chainA);
    const isBInEthereum = ethereumEcosystem.includes(chainB);
    
    if (isAInEthereum && isBInEthereum) return false;
    if (polygonEcosystem.includes(chainA) && polygonEcosystem.includes(chainB)) return false;
    if (avalancheEcosystem.includes(chainA) && avalancheEcosystem.includes(chainB)) return false;
    if (bnbEcosystem.includes(chainA) && bnbEcosystem.includes(chainB)) return false;
    
    return true;
  }

  getIntent(intentId: string): BridgeIntent | undefined {
    return this.intents.get(intentId);
  }

  getProgress(intentId: string): BridgeProgress | undefined {
    return this.progressTrackers.get(intentId);
  }

  getAllIntents(): BridgeIntent[] {
    return Array.from(this.intents.values());
  }
}

export const nexusBridge = new NexusBridge();