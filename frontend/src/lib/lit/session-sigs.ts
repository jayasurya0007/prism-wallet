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
    const sessionKey = `${pkpPublicKey}_${chain}`;
    return this.sessions.get(sessionKey) || null;
  }

  async refreshSessionSigs(config: SessionConfig): Promise<SessionSigs> {
    const sessionKey = `${config.pkpPublicKey}_${config.chain}`;
    this.sessions.delete(sessionKey);
    return await this.createSessionSigs(config);
  }

  isSessionValid(pkpPublicKey: string, chain: string): boolean {
    const sessionSigs = this.getSessionSigs(pkpPublicKey, chain);
    if (!sessionSigs) return false;

    // Check if any session signature is still valid
    for (const [nodeAddress, sessionSig] of Object.entries(sessionSigs)) {
      try {
        const payload = JSON.parse(atob(sessionSig.sig.split('.')[1]));
        const expiration = new Date(payload.exp * 1000);
        if (expiration > new Date()) {
          return true;
        }
      } catch (error) {
        // Error parsing session signature
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