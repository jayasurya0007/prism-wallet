import { litClient } from './client';
import { sessionManager } from './session-sigs';
import { policyEngine, TransactionData } from './policy-engine';
import { PKPSigningRequest, PKPSigningResponse, SigningPolicy } from '../../types/lit';

export interface LitActionConfig {
  ipfsId?: string;
  code?: string;
}

export class AutonomousSigner {
  private litActionConfig: LitActionConfig | null = null;
  private signingHistory: Map<string, number> = new Map();

  setLitAction(config: LitActionConfig): void {
    this.litActionConfig = config;
  }

  async executeAutonomousSign(request: PKPSigningRequest, txData: TransactionData): Promise<PKPSigningResponse> {
    // Validate policy first
    const validation = policyEngine.validateTransaction(request.pkpPublicKey, txData);
    
    if (!validation.isValid) {
      throw new Error(`Policy validation failed: ${validation.errors.join(', ')}`);
    }

    // Get session signatures
    const sessionSigs = sessionManager.getSessionSigs(request.pkpPublicKey, request.chain || 'ethereum');
    
    if (!sessionSigs) {
      throw new Error('No valid session signatures found');
    }

    // Update last signing time
    const now = Math.floor(Date.now() / 1000);
    this.signingHistory.set(request.pkpPublicKey, now);
    txData.lastSigningTime = this.signingHistory.get(request.pkpPublicKey);

    // Prepare Lit Action parameters
    const litActionParams = {
      toSign: request.toSign,
      publicKey: request.pkpPublicKey,
      sigName: request.sigName,
      transactionData: JSON.stringify(txData),
      policy: JSON.stringify(policyEngine.getPolicy(request.pkpPublicKey))
    };

    try {
      await litClient.connect();
      
      let result;
      
      if (this.litActionConfig?.ipfsId) {
        // Validate IPFS ID format
        if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(this.litActionConfig.ipfsId)) {
          throw new Error('Invalid IPFS ID format');
        }
        
        // Execute Lit Action from IPFS
        result = await litClient.getClient().executeJs({
          ipfsId: this.litActionConfig.ipfsId,
          sessionSigs,
          jsParams: litActionParams
        });
      } else if (this.litActionConfig?.code) {
        // Validate code contains only safe operations
        if (this.litActionConfig.code.includes('eval(') || 
            this.litActionConfig.code.includes('Function(') ||
            this.litActionConfig.code.includes('require(')) {
          throw new Error('Unsafe code operations detected');
        }
        
        // Execute inline Lit Action code
        result = await litClient.getClient().executeJs({
          code: this.litActionConfig.code,
          sessionSigs,
          jsParams: litActionParams
        });
      } else {
        throw new Error('No Lit Action configured');
      }

      // Validate response format before parsing
      if (!result.response || typeof result.response !== 'string') {
        throw new Error('Invalid response format from Lit Action');
      }
      
      const response = JSON.parse(result.response);
      
      if (!response.success) {
        // Sanitize error message to prevent code injection
        const sanitizedError = typeof response.error === 'string' ? 
          response.error.replace(/[<>"'&]/g, '') : 'Unknown error';
        throw new Error(sanitizedError);
      }

      return {
        signature: response.signature,
        publicKey: request.pkpPublicKey,
        dataSigned: typeof request.toSign === 'string' ? request.toSign : Buffer.from(request.toSign).toString('hex')
      };

    } catch (error) {
      console.error('Autonomous signing failed:', error);
      throw error;
    }
  }

  async signWithPolicy(
    pkpPublicKey: string, 
    toSign: Uint8Array | string, 
    txData: TransactionData,
    sigName: string = 'agentSignature'
  ): Promise<PKPSigningResponse> {
    const request: PKPSigningRequest = {
      pkpPublicKey,
      toSign,
      sigName
    };

    return await this.executeAutonomousSign(request, txData);
  }

  setupDefaultLitAction(): void {
    // Use the signing policy Lit Action code
    const litActionCode = `
      const go = async () => {
        const { toSign, publicKey, sigName, transactionData, policy } = Lit.Actions.getParams();
        
        const defaultPolicy = {
          maxAmount: 100,
          allowedChains: [1, 10, 137, 42161],
          requireGasBelow: 200,
          allowedTokens: ['USDC', 'USDT', 'ETH'],
          cooldownPeriod: 300
        };

        let activePolicy = defaultPolicy;
        if (policy && typeof policy === 'string') {
          try {
            // Validate policy string before parsing
            if (policy.length > 10000 || /[<>"'&]/.test(policy)) {
              throw new Error('Invalid policy format');
            }
            activePolicy = JSON.parse(policy);
          } catch (e) {
            // Use default policy if parsing fails
            activePolicy = defaultPolicy;
          }
        }

        try {
          const txData = JSON.parse(transactionData);
          
          if (txData.amount && parseFloat(txData.amount) > activePolicy.maxAmount) {
            return Lit.Actions.setResponse({ 
              response: JSON.stringify({ 
                success: false,
                error: \`Amount \${txData.amount} exceeds limit of \${activePolicy.maxAmount}\`
              })
            });
          }

          if (txData.chainId && !activePolicy.allowedChains.includes(txData.chainId)) {
            return Lit.Actions.setResponse({ 
              response: JSON.stringify({ 
                success: false,
                error: \`Chain \${txData.chainId} not allowed\`
              })
            });
          }

          if (txData.gasPrice && txData.gasPrice > activePolicy.requireGasBelow * 1e9) {
            return Lit.Actions.setResponse({ 
              response: JSON.stringify({ 
                success: false,
                error: \`Gas price too high\`
              })
            });
          }

          const sigShare = await Lit.Actions.signEcdsa({
            toSign,
            publicKey,
            sigName
          });

          Lit.Actions.setResponse({ 
            response: JSON.stringify({ 
              success: true,
              signature: sigShare,
              timestamp: Math.floor(Date.now() / 1000)
            })
          });

        } catch (error) {
          Lit.Actions.setResponse({ 
            response: JSON.stringify({ 
              success: false,
              error: error.message
            })
          });
        }
      };

      go();
    `;

    this.setLitAction({ code: litActionCode });
  }

  getSigningHistory(pkpPublicKey: string): number | null {
    return this.signingHistory.get(pkpPublicKey) || null;
  }

  clearSigningHistory(pkpPublicKey?: string): void {
    if (pkpPublicKey) {
      this.signingHistory.delete(pkpPublicKey);
    } else {
      this.signingHistory.clear();
    }
  }
}

export const autonomousSigner = new AutonomousSigner();