import { SessionSigs, AuthMethod, LitResourceAbilityRequest } from '@lit-protocol/types';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { litClient } from './client';

export interface SessionConfig {
  pkpPublicKey: string;
  authMethods: AuthMethod[];
  chain: string;
  expiration?: Date;
  resourceAbilities?: LitResourceAbilityRequest[];
}

export class SessionSignatureManager {
  private sessions: Map<string, SessionSigs> = new Map();

  async createSessionSigs(config: SessionConfig): Promise<SessionSigs> {
    // Validate configuration
    if (!config || typeof config !== 'object') {
      throw new Error('Valid session configuration is required');
    }
    
    if (!config.pkpPublicKey || typeof config.pkpPublicKey !== 'string') {
      throw new Error('Valid PKP public key is required');
    }
    
    if (!/^0x[a-fA-F0-9]{130}$/.test(config.pkpPublicKey)) {
      throw new Error('Invalid PKP public key format');
    }
    
    if (!config.authMethods || !Array.isArray(config.authMethods) || config.authMethods.length === 0) {
      throw new Error('At least one auth method is required');
    }
    
    if (!config.chain || typeof config.chain !== 'string') {
      throw new Error('Valid chain is required');
    }
    
    // Validate chain name format
    if (!/^[a-zA-Z0-9-_]+$/.test(config.chain)) {
      throw new Error('Invalid chain format');
    }

    await litClient.connect();

    const expiration = config.expiration || new Date(Date.now() + 3600000); // 1 hour default
    
    // Use official resource ability configuration from Lit docs
    const resourceAbilities = config.resourceAbilities || [
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.PKPSigning
      }
    ];

    // Official getPkpSessionSigs method from Lit Protocol documentation
    const sessionSigs = await litClient.getClient().getPkpSessionSigs({
      pkpPublicKey: config.pkpPublicKey,
      authMethods: config.authMethods,
      chain: config.chain,
      expiration: expiration.toISOString(),
      resourceAbilityRequests: resourceAbilities,
      // Additional options from official docs
      sessionCapabilities: {
        signing: true,
        litActionExecution: true
      }
    });

    const sessionKey = `${config.pkpPublicKey}_${config.chain}`;
    this.sessions.set(sessionKey, sessionSigs);
    
    // Session signatures created successfully
    return sessionSigs;
  }

  getSessionSigs(pkpPublicKey: string, chain: string): SessionSigs | null {
    // Validate inputs
    if (!pkpPublicKey || typeof pkpPublicKey !== 'string') {
      return null;
    }
    
    if (!chain || typeof chain !== 'string') {
      return null;
    }
    
    if (!/^0x[a-fA-F0-9]{130}$/.test(pkpPublicKey)) {
      return null;
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(chain)) {
      return null;
    }

    const sessionKey = `${pkpPublicKey}_${chain}`;
    return this.sessions.get(sessionKey) || null;
  }

  async refreshSessionSigs(config: SessionConfig): Promise<SessionSigs> {
    const sessionKey = `${config.pkpPublicKey}_${config.chain}`;
    this.sessions.delete(sessionKey);
    return await this.createSessionSigs(config);
  }

  isSessionValid(pkpPublicKey: string, chain: string): boolean {
    // Input validation is handled by getSessionSigs
    const sessionSigs = this.getSessionSigs(pkpPublicKey, chain);
    if (!sessionSigs) return false;

    // Check if any session signature is still valid
    for (const [nodeAddress, sessionSig] of Object.entries(sessionSigs)) {
      try {
        // Validate signature format before parsing
        if (!sessionSig.sig || typeof sessionSig.sig !== 'string') {
          continue;
        }
        
        const parts = sessionSig.sig.split('.');
        if (parts.length !== 3) {
          continue;
        }
        
        // Validate base64 format
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(parts[1])) {
          continue;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        
        // Validate payload structure
        if (!payload.exp || typeof payload.exp !== 'number') {
          continue;
        }
        
        const expiration = new Date(payload.exp * 1000);
        if (expiration > new Date()) {
          return true;
        }
      } catch (error) {
        // Skip invalid session signature
        continue;
      }
    }
    
    return false;
  }

  clearExpiredSessions(): void {
    const expiredKeys: string[] = [];
    
    for (const [sessionKey, sessionSigs] of this.sessions.entries()) {
      const [pkpPublicKey, chain] = sessionKey.split('_');
      if (!this.isSessionValid(pkpPublicKey, chain)) {
        expiredKeys.push(sessionKey);
      }
    }
    
    expiredKeys.forEach(key => {
      this.sessions.delete(key);
      // Expired session removed
    });
  }

  clearAllSessions(): void {
    this.sessions.clear();
    // All sessions cleared
  }

  getActiveSessions(): Array<{ pkpPublicKey: string; chain: string; expiration: Date }> {
    const activeSessions: Array<{ pkpPublicKey: string; chain: string; expiration: Date }> = [];
    
    for (const [sessionKey, sessionSigs] of this.sessions.entries()) {
      const [pkpPublicKey, chain] = sessionKey.split('_');
      
      if (this.isSessionValid(pkpPublicKey, chain)) {
        // Get expiration from first valid signature
        for (const [nodeAddress, sessionSig] of Object.entries(sessionSigs)) {
          try {
            const payload = JSON.parse(atob(sessionSig.sig.split('.')[1]));
            const expiration = new Date(payload.exp * 1000);
            activeSessions.push({ pkpPublicKey, chain, expiration });
            break;
          } catch (error) {
            continue;
          }
        }
      }
    }
    
    return activeSessions;
  }
}

export const sessionManager = new SessionSignatureManager();