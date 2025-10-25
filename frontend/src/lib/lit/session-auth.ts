import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';
import { litClient } from './client';

export class SessionAuthManager {
  private authClient: LitAuthClient;
  private sessionSigs: any = null;

  constructor() {
    this.authClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY || '',
      },
    });
  }

  async authenticateWithPKP(): Promise<any> {
    await litClient.connect();

    // For existing PKP, create session signatures directly
    // Reference: https://developer.litprotocol.com/sdk/authentication/session-sigs/intro
    const pkpPublicKey = process.env.NEXT_PUBLIC_LIT_PKP_PUBLIC_KEY;
    const tokenId = process.env.NEXT_PUBLIC_LIT_TOKEN_ID;

    if (!pkpPublicKey || !tokenId) {
      throw new Error('PKP configuration missing');
    }

    try {
      // Official Lit Protocol AuthMethod structure
      // Reference: https://developer.litprotocol.com/sdk/authentication/session-sigs/intro
      const authMethod = {
        authMethodType: 1,
        accessToken: tokenId
      };
      
      this.sessionSigs = await litClient.getClient().getSessionSigs({
        pkpPublicKey,
        authMethods: [authMethod],
        chain: 'ethereum',
        resourceAbilityRequests: []
      });

      return this.sessionSigs;
    } catch (error) {
      console.error('Session signature creation error:', error);
      throw new Error(`Session signature creation failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  }

  getSessionSigs(): any {
    return this.sessionSigs;
  }

  hasValidSession(): boolean {
    return this.sessionSigs !== null;
  }

  clearSession(): void {
    this.sessionSigs = null;
  }
}

export const sessionAuthManager = new SessionAuthManager();