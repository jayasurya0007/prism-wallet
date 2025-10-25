import { AuthMethod } from '@lit-protocol/types';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';

export interface AuthConfig {
  provider: ProviderType;
  redirectUri?: string;
}

export interface AuthResult {
  authMethod: AuthMethod;
  pkpInfo?: {
    tokenId: string;
    publicKey: string;
    ethAddress: string;
  };
}

export class LitAuth {
  private authClient: LitAuthClient;
  private authMethods: Map<string, AuthMethod> = new Map();

  constructor() {
    this.authClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: process.env.LIT_RELAY_API_KEY || 'test-api-key'
      }
    });
  }

  async authenticateWithGoogle(redirectUri?: string): Promise<AuthResult> {
    try {
      const provider = this.authClient.initProvider(ProviderType.Google, {
        redirectUri: redirectUri || window.location.origin
      });

      const authMethod = await provider.authenticate();
      this.storeAuthMethod('google', authMethod);

      return { authMethod };
    } catch (error) {
      console.error('Google authentication failed:', error);
      throw error;
    }
  }

  async authenticateWithDiscord(redirectUri?: string): Promise<AuthResult> {
    try {
      const provider = this.authClient.initProvider(ProviderType.Discord, {
        redirectUri: redirectUri || window.location.origin
      });

      const authMethod = await provider.authenticate();
      this.storeAuthMethod('discord', authMethod);

      return { authMethod };
    } catch (error) {
      console.error('Discord authentication failed:', error);
      throw error;
    }
  }

  async authenticateWithWebAuthn(): Promise<AuthResult> {
    try {
      const provider = this.authClient.initProvider(ProviderType.WebAuthn);
      const options = await provider.register();
      
      const authMethod = await provider.authenticate(options);
      this.storeAuthMethod('webauthn', authMethod);

      return { authMethod };
    } catch (error) {
      console.error('WebAuthn authentication failed:', error);
      throw error;
    }
  }

  async createPKPWithAuth(authMethod: AuthMethod): Promise<{
    tokenId: string;
    publicKey: string;
    ethAddress: string;
  }> {
    try {
      const mintInfo = await this.authClient.mintPKPThroughRelayer(authMethod);
      
      return {
        tokenId: mintInfo.tokenId,
        publicKey: mintInfo.publicKey,
        ethAddress: mintInfo.ethAddress
      };
    } catch (error) {
      console.error('PKP creation failed:', error);
      throw error;
    }
  }

  getStoredAuthMethod(provider: string): AuthMethod | null {
    return this.authMethods.get(provider) || null;
  }

  private storeAuthMethod(provider: string, authMethod: AuthMethod): void {
    this.authMethods.set(provider, authMethod);
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(`lit_auth_${provider}`, JSON.stringify(authMethod));
    } catch (error) {
      console.warn('Failed to store auth method in localStorage:', error);
    }
  }

  loadStoredAuthMethods(): void {
    const providers = ['google', 'discord', 'webauthn'];
    
    providers.forEach(provider => {
      try {
        const stored = localStorage.getItem(`lit_auth_${provider}`);
        if (stored) {
          const authMethod = JSON.parse(stored);
          this.authMethods.set(provider, authMethod);
        }
      } catch (error) {
        console.warn(`Failed to load stored auth method for ${provider}:`, error);
      }
    });
  }

  clearAuthMethod(provider: string): void {
    this.authMethods.delete(provider);
    localStorage.removeItem(`lit_auth_${provider}`);
  }

  clearAllAuthMethods(): void {
    this.authMethods.clear();
    const providers = ['google', 'discord', 'webauthn'];
    providers.forEach(provider => {
      localStorage.removeItem(`lit_auth_${provider}`);
    });
  }

  getAllAuthMethods(): AuthMethod[] {
    return Array.from(this.authMethods.values());
  }

  isAuthenticated(provider?: string): boolean {
    if (provider) {
      return this.authMethods.has(provider);
    }
    return this.authMethods.size > 0;
  }
}

export const litAuth = new LitAuth();