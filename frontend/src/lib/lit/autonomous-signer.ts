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
    // Validate inputs first
    if (!request || typeof request !== 'object') {
      throw new Error('Invalid signing request');
    }
    
    if (!request.pkpPublicKey || typeof request.pkpPublicKey !== 'string') {
      throw new Error('Valid PKP public key is required');
    }
    
    if (!/^0x[a-fA-F0-9]{130}$/.test(request.pkpPublicKey)) {
      throw new Error('Invalid PKP public key format');
    }
    
    if (!txData || typeof txData !== 'object') {
      throw new Error('Valid transaction data is required');
    }
    
    // Validate policy
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

    // Prepare and validate Lit Action parameters
    let transactionDataStr: string;
    let policyStr: string;
    
    try {
      transactionDataStr = JSON.stringify(txData);
      policyStr = JSON.stringify(policyEngine.getPolicy(request.pkpPublicKey));
    } catch (error) {
      throw new Error('Failed to serialize transaction data or policy');
    }
    
    // Validate serialized data size
    if (transactionDataStr.length > 5000 || policyStr.length > 5000) {
      throw new Error('Transaction data or policy too large');
    }
    
    const litActionParams = {
      toSign: request.toSign,
      publicKey: request.pkpPublicKey,
      sigName: request.sigName || 'agentSignature',
      transactionData: transactionDataStr,
      policy: policyStr
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
        // Comprehensive code validation to prevent injection
        const unsafePatterns = [
          /eval\s*\(/,
          /Function\s*\(/,
          /require\s*\(/,
          /import\s*\(/,
          /process\./,
          /global\./,
          /window\./,
          /document\./,
          /__dirname/,
          /__filename/,
          /Buffer\./,
          /fs\./,
          /child_process/,
          /exec\s*\(/,
          /spawn\s*\(/,
          /\$\{.*\}/,
          /\[.*\]\s*\(/
        ];
        
        const hasUnsafeCode = unsafePatterns.some(pattern => 
          pattern.test(this.litActionConfig.code!)
        );
        
        if (hasUnsafeCode) {
          throw new Error('Code contains unsafe operations');
        }
        
        // Additional length and content validation
        if (this.litActionConfig.code.length > 50000) {
          throw new Error('Code too long');
        }
        
        // For security, only allow pre-approved IPFS-based Lit Actions
        // Dynamic code execution is disabled to prevent injection attacks
        throw new Error('Dynamic code execution not allowed for security reasons. Use IPFS-based Lit Actions only.');
      } else {
        throw new Error('No Lit Action configured');
      }

      // Validate response format and content before parsing
      if (!result.response || typeof result.response !== 'string') {
        throw new Error('Invalid response format from Lit Action');
      }
      
      // Validate JSON string before parsing to prevent injection
      if (result.response.length > 10000) {
        throw new Error('Response too large');
      }
      
      // Check for potential injection patterns in response
      if (/<script|javascript:|data:|vbscript:/i.test(result.response)) {
        throw new Error('Unsafe content in response');
      }
      
      let response;
      try {
        response = JSON.parse(result.response);
      } catch (parseError) {
        throw new Error('Invalid JSON response from Lit Action');
      }
      
      if (!response.success) {
        // Comprehensive error message sanitization
        let sanitizedError = 'Unknown error';
        if (typeof response.error === 'string') {
          sanitizedError = response.error
            .replace(/[<>"'&\\]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .substring(0, 200); // Limit error message length
        }
        throw new Error(sanitizedError);
      }

      // Validate response signature format
      if (!response.signature || typeof response.signature !== 'object') {
        throw new Error('Invalid signature format in response');
      }
      
      return {
        signature: response.signature,
        publicKey: request.pkpPublicKey,
        dataSigned: typeof request.toSign === 'string' ? 
          request.toSign.substring(0, 1000) : // Limit string length
          Buffer.from(request.toSign).toString('hex')
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
    // Use pre-validated signing policy Lit Action code
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
            // Comprehensive policy validation
            if (policy.length > 5000) {
              throw new Error('Policy too large');
            }
            
            if (/<script|javascript:|data:|eval\(|Function\(/i.test(policy)) {
              throw new Error('Unsafe policy content');
            }
            activePolicy = JSON.parse(policy);
          } catch (e) {
            // Use default policy if parsing fails
            activePolicy = defaultPolicy;
          }
        }

        try {
          const txData = JSON.parse(transactionData);
          
          // Validate amount safely
          const amount = parseFloat(txData.amount);
          if (txData.amount && !isNaN(amount) && amount > activePolicy.maxAmount) {
            return Lit.Actions.setResponse({ 
              response: JSON.stringify({ 
                success: false,
                error: 'Amount exceeds policy limit'
              })
            });
          }

          // Validate chain ID safely
          const chainId = parseInt(txData.chainId);
          if (txData.chainId && !isNaN(chainId) && !activePolicy.allowedChains.includes(chainId)) {
            return Lit.Actions.setResponse({ 
              response: JSON.stringify({ 
                success: false,
                error: 'Chain not allowed by policy'
              })
            });
          }

          // Validate gas price safely
          const gasPrice = parseFloat(txData.gasPrice);
          if (txData.gasPrice && !isNaN(gasPrice) && gasPrice > activePolicy.requireGasBelow * 1e9) {
            return Lit.Actions.setResponse({ 
              response: JSON.stringify({ 
                success: false,
                error: 'Gas price exceeds policy limit'
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

    // For security, use IPFS-based Lit Action instead of dynamic code
    // This prevents code injection vulnerabilities
    console.warn('Dynamic Lit Action code disabled for security. Deploy to IPFS and use IPFS ID instead.');
    // this.setLitAction({ code: litActionCode });
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