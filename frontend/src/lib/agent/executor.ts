import { nexusClient } from '../nexus/client';
import { autonomousSigner } from '../lit/autonomous-signer';
import { actionValidator } from './validator';

export interface ExecutionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  logs: string[];
}

export class ActionExecutor {
  private logs: string[] = [];
  
  async execute(action: any, context: any): Promise<ExecutionResult> {
    this.logs = [];
    
    if (!action?.type || typeof action.type !== 'string') {
      return { success: false, error: 'Invalid action type', logs: [] };
    }
    
    const allowedTypes = ['bridge', 'swap', 'transfer'];
    if (!allowedTypes.includes(action.type)) {
      return { success: false, error: 'Action type not allowed', logs: [] };
    }
    
    this.log(`Starting execution: ${action.type}`);
    
    try {
      this.log('Validating action...');
      const validation = await actionValidator.validate(action, context);
      
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Get signature from Lit Protocol PKP
      this.log('Requesting PKP signature...');
      const signature = await autonomousSigner.signAction(action);
      
      if (!signature) {
        throw new Error('Failed to obtain PKP signature');
      }
      
      // Execute through Avail Nexus
      this.log('Executing through Avail Nexus...');
      const txHash = await this.executeOnChain(action, signature);
      
      this.log(`Execution complete: ${txHash}`);
      
      return {
        success: true,
        txHash,
        logs: this.logs
      };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Execution failed';
      this.log(`Error: ${errorMsg}`);
      
      return {
        success: false,
        error: errorMsg,
        logs: this.logs
      };
    }
  }
  
  private async executeOnChain(action: any, signature: string): Promise<string> {
    if (!signature || typeof signature !== 'string') {
      throw new Error('Invalid signature');
    }
    
    const allowedTypes = ['bridge', 'swap', 'transfer'];
    if (!allowedTypes.includes(action.type)) {
      throw new Error('Invalid action type');
    }
    
    try {
      switch (action.type) {
        case 'bridge':
          return await this.executeBridge(action);
        case 'swap':
          return await this.executeSwap(action);
        case 'transfer':
          return await this.executeTransfer(action);
        default:
          throw new Error('Invalid action type');
      }
    } catch (error) {
      throw new Error(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeBridge(action: any): Promise<string> {
    if (!action?.fromChain || !action?.toChain || !action?.token || !action?.amount) {
      throw new Error('Invalid bridge parameters');
    }
    
    const fromChain = Number(action.fromChain);
    const toChain = Number(action.toChain);
    
    if (!Number.isInteger(fromChain) || !Number.isInteger(toChain)) {
      throw new Error('Invalid chain IDs');
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(String(action.token))) {
      throw new Error('Invalid token address');
    }
    
    try {
      const result = await nexusClient.getClient().bridge({
        fromChain,
        toChain,
        token: String(action.token),
        amount: String(action.amount)
      });
      
      return result.txHash || 'pending';
    } catch (error) {
      throw new Error(`Bridge execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeSwap(action: any): Promise<string> {
    if (!action?.token || !action?.amount) {
      throw new Error('Invalid swap parameters');
    }
    
    try {
      // Implement swap logic through Avail Nexus
      return 'swap_tx_hash';
    } catch (error) {
      throw new Error(`Swap execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async executeTransfer(action: any): Promise<string> {
    if (!action?.to || !action?.amount) {
      throw new Error('Invalid transfer parameters');
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(String(action.to))) {
      throw new Error('Invalid recipient address');
    }
    
    try {
      // Implement transfer logic
      return 'transfer_tx_hash';
    } catch (error) {
      throw new Error(`Transfer execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private log(message: string): void {
    if (typeof message !== 'string') return;
    
    const sanitized = message.replace(/[\r\n]/g, ' ').substring(0, 200);
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${sanitized}`);
    console.log(`[Executor] ${sanitized}`);
  }
}

export const actionExecutor = new ActionExecutor();
