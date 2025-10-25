import { sessionManager } from './session-sigs';
import { permissionManager } from './permissions';
import { AuthMethod } from '@lit-protocol/types';

export interface KeyRotationConfig {
  rotationInterval: number; // in milliseconds
  maxSessionAge: number; // in milliseconds
  autoRotate: boolean;
}

export interface RotationEvent {
  pkpPublicKey: string;
  oldSessionId: string;
  newSessionId: string;
  timestamp: Date;
  reason: 'scheduled' | 'manual' | 'security';
}

export class KeyRotationManager {
  private rotationConfig: Map<string, KeyRotationConfig> = new Map();
  private rotationHistory: RotationEvent[] = [];
  private rotationTimers: Map<string, NodeJS.Timeout> = new Map();

  setRotationConfig(pkpPublicKey: string, config: KeyRotationConfig): void {
    this.rotationConfig.set(pkpPublicKey, config);
    
    if (config.autoRotate) {
      this.scheduleRotation(pkpPublicKey);
    }
  }

  async rotateSessionKeys(
    pkpPublicKey: string, 
    authMethods: AuthMethod[], 
    reason: 'scheduled' | 'manual' | 'security' = 'manual'
  ): Promise<boolean> {
    try {
      // Get current session info
      const currentSessions = sessionManager.getActiveSessions();
      const currentSession = currentSessions.find(s => s.pkpPublicKey === pkpPublicKey);
      
      if (!currentSession) {
        console.warn('No active session found for rotation');
        return false;
      }

      const oldSessionId = `${pkpPublicKey}_${currentSession.chain}`;

      // Create new session signatures
      const newSessionSigs = await sessionManager.refreshSessionSigs({
        pkpPublicKey,
        authMethods,
        chain: currentSession.chain
      });

      const newSessionId = `${pkpPublicKey}_${currentSession.chain}_${Date.now()}`;

      // Record rotation event
      const rotationEvent: RotationEvent = {
        pkpPublicKey,
        oldSessionId,
        newSessionId,
        timestamp: new Date(),
        reason
      };

      this.rotationHistory.push(rotationEvent);

      // Clean up old permissions if needed
      if (reason === 'security') {
        await this.revokeOldPermissions(pkpPublicKey);
      }

      console.log(`Session keys rotated for PKP: ${pkpPublicKey}, reason: ${reason}`);
      return true;

    } catch (error) {
      console.error('Key rotation failed:', error);
      return false;
    }
  }

  private scheduleRotation(pkpPublicKey: string): void {
    const config = this.rotationConfig.get(pkpPublicKey);
    if (!config || !config.autoRotate) return;

    // Clear existing timer
    const existingTimer = this.rotationTimers.get(pkpPublicKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new rotation
    const timer = setTimeout(async () => {
      const authMethods = []; // Would need to get stored auth methods
      await this.rotateSessionKeys(pkpPublicKey, authMethods, 'scheduled');
      
      // Reschedule next rotation
      this.scheduleRotation(pkpPublicKey);
    }, config.rotationInterval);

    this.rotationTimers.set(pkpPublicKey, timer);
  }

  private async revokeOldPermissions(pkpPublicKey: string): Promise<void> {
    // Get all permissions for the PKP
    const permissions = permissionManager.getPermissions(pkpPublicKey);
    
    // Revoke permissions older than max session age
    const config = this.rotationConfig.get(pkpPublicKey);
    if (!config) return;

    const cutoffTime = new Date(Date.now() - config.maxSessionAge);
    
    permissions.forEach(permission => {
      if (permission.grantedAt < cutoffTime) {
        permissionManager.revokePermission(
          pkpPublicKey, 
          permission.resource, 
          permission.ability
        );
      }
    });
  }

  checkSessionAge(pkpPublicKey: string, chain: string): {
    isExpired: boolean;
    age: number;
    shouldRotate: boolean;
  } {
    const sessions = sessionManager.getActiveSessions();
    const session = sessions.find(s => 
      s.pkpPublicKey === pkpPublicKey && s.chain === chain
    );

    if (!session) {
      return { isExpired: true, age: 0, shouldRotate: true };
    }

    const now = new Date();
    const age = now.getTime() - session.expiration.getTime();
    const config = this.rotationConfig.get(pkpPublicKey);
    
    const isExpired = !sessionManager.isSessionValid(pkpPublicKey, chain);
    const shouldRotate = config ? age > config.maxSessionAge : false;

    return { isExpired, age, shouldRotate };
  }

  getRotationHistory(pkpPublicKey?: string): RotationEvent[] {
    if (pkpPublicKey) {
      return this.rotationHistory.filter(event => event.pkpPublicKey === pkpPublicKey);
    }
    return [...this.rotationHistory];
  }

  getRotationConfig(pkpPublicKey: string): KeyRotationConfig | null {
    return this.rotationConfig.get(pkpPublicKey) || null;
  }

  stopAutoRotation(pkpPublicKey: string): void {
    const timer = this.rotationTimers.get(pkpPublicKey);
    if (timer) {
      clearTimeout(timer);
      this.rotationTimers.delete(pkpPublicKey);
    }

    const config = this.rotationConfig.get(pkpPublicKey);
    if (config) {
      config.autoRotate = false;
      this.rotationConfig.set(pkpPublicKey, config);
    }
  }

  startAutoRotation(pkpPublicKey: string): void {
    const config = this.rotationConfig.get(pkpPublicKey);
    if (config) {
      config.autoRotate = true;
      this.rotationConfig.set(pkpPublicKey, config);
      this.scheduleRotation(pkpPublicKey);
    }
  }

  createDefaultRotationConfig(): KeyRotationConfig {
    return {
      rotationInterval: 24 * 60 * 60 * 1000, // 24 hours
      maxSessionAge: 60 * 60 * 1000, // 1 hour
      autoRotate: false
    };
  }

  cleanup(): void {
    // Clear all timers
    for (const timer of this.rotationTimers.values()) {
      clearTimeout(timer);
    }
    this.rotationTimers.clear();

    // Clean up expired sessions
    sessionManager.clearExpiredSessions();
    
    // Clean up expired permissions
    permissionManager.cleanupExpiredPermissions();
  }
}

export const keyRotationManager = new KeyRotationManager();