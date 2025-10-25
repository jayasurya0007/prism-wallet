import { AuthMethod } from '@lit-protocol/types';

export interface AuthResult {
  authMethod: AuthMethod;
  pkpInfo?: {
    tokenId: string;
    publicKey: string;
    ethAddress: string;
  };
}

export class LitAuth {
  private authMethods: Map<string, AuthMethod> = new Map();

  constructor() {
    this.loadStoredAuthMethods();
  }

  async authenticateWithMock(provider: string): Promise<AuthResult> {
    // Mock authentication for demo purposes
    const authMethod: AuthMethod = {
      authMethodType: 1,
      accessToken: `mock-${provider}-token-${Date.now()}`
    };

    this.storeAuthMethod(provider, authMethod);
    return { authMethod };
  }

  async createPKPWithAuth(authMethod: AuthMethod): Promise<{
    tokenId: string;
    publicKey: string;
    ethAddress: string;
  }> {
    // Mock PKP creation for demo
    const mockPKP = {
      tokenId: `mock-token-${Date.now()}`,
      publicKey: `0x04${Math.random().toString(16).substr(2, 128)}`,
      ethAddress: `0x${Math.random().toString(16).substr(2, 40)}`
    };

    return mockPKP;
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