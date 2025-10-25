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
    // Validate provider
    if (!provider || typeof provider !== 'string') {
      throw new Error('Valid provider is required');
    }
    
    // Validate provider format
    if (!/^[a-zA-Z0-9-_]+$/.test(provider) || provider.length > 50) {
      throw new Error('Invalid provider format');
    }
    
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
    // Validate auth method
    if (!authMethod || typeof authMethod !== 'object') {
      throw new Error('Valid auth method is required');
    }
    
    if (typeof authMethod.authMethodType !== 'number') {
      throw new Error('Invalid auth method type');
    }
    // Mock PKP creation for demo
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const randomHex = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    
    const mockPKP = {
      tokenId: `mock-token-${Date.now()}`,
      publicKey: `0x04${randomHex.slice(0, 128)}`,
      ethAddress: `0x${randomHex.slice(0, 40)}`
    };

    return mockPKP;
  }

  getStoredAuthMethod(provider: string): AuthMethod | null {
    // Validate provider
    if (!provider || typeof provider !== 'string') {
      return null;
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(provider)) {
      return null;
    }
    
    return this.authMethods.get(provider) || null;
  }

  private storeAuthMethod(provider: string, authMethod: AuthMethod): void {
    // Validate inputs
    if (!provider || typeof provider !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(provider)) {
      throw new Error('Invalid provider');
    }
    
    if (!authMethod || typeof authMethod !== 'object') {
      throw new Error('Invalid auth method');
    }
    
    this.authMethods.set(provider, authMethod);
    
    // Store in localStorage for persistence
    try {
      const serialized = JSON.stringify(authMethod);
      if (serialized.length > 10000) {
        throw new Error('Auth method data too large');
      }
      localStorage.setItem(`lit_auth_${provider}`, serialized);
    } catch (error) {
      // Failed to store auth method in localStorage
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
        // Failed to load stored auth method
      }
    });
  }

  clearAuthMethod(provider: string): void {
    // Validate provider
    if (!provider || typeof provider !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(provider)) {
      return;
    }
    
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
      // Validate provider format
      if (typeof provider !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(provider)) {
        return false;
      }
      return this.authMethods.has(provider);
    }
    return this.authMethods.size > 0;
  }
}

export const litAuth = new LitAuth();