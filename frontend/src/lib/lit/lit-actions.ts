import { litClient } from './client';

export class LitActionsManager {
  async executeSigningAction(message: string): Promise<any> {
    await litClient.connect();
    
    // Convert message to bytes array for your Lit Action
    const toSign = Array.from(new TextEncoder().encode(message));
    
    // Your exact Lit Action code from the portal
    const litActionCode = `
      const go = async () => {
        const toSign = [${toSign.join(',')}];
        
        const sigShare = await Lit.Actions.signEcdsa({
          toSign,
          publicKey,
          sigName: "sig1",
        });
      };
      
      go();
    `;
    
    try {
      const { sessionAuthManager } = await import('./session-auth');
      
      // Get session signatures using official Lit Protocol method
      let sessionSigs = sessionAuthManager.getSessionSigs();
      if (!sessionSigs) {
        sessionSigs = await sessionAuthManager.authenticateWithPKP();
      }
      
      // Official executeJs with session signatures
      // Reference: https://developer.litprotocol.com/sdk/authentication/session-sigs/intro
      const response = await litClient.getClient().executeJs({
        code: litActionCode,
        jsParams: {
          publicKey: process.env.NEXT_PUBLIC_LIT_PKP_PUBLIC_KEY
        },
        sessionSigs
      });
      
      return response;
    } catch (error) {
      console.error('Lit Action execution error:', error);
      throw new Error(`Lit Action execution failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  }
  
  async signMessage(message: string): Promise<string> {
    const result = await this.executeSigningAction(message);
    return result.signatures?.sig1 || 'Signature not found';
  }
}

export const litActionsManager = new LitActionsManager();