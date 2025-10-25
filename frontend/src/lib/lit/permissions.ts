import { LitResourceAbilityRequest, LitAbility } from '@lit-protocol/auth-helpers';
import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';

export interface PermissionConfig {
  pkpPublicKey: string;
  abilities: LitAbility[];
  resources: string[];
  expiration?: Date;
}

export interface ResourcePermission {
  resource: string;
  ability: LitAbility;
  granted: boolean;
  grantedAt: Date;
  expiresAt?: Date;
}

export class PermissionManager {
  private permissions: Map<string, ResourcePermission[]> = new Map();

  createResourceAbilityRequests(config: PermissionConfig): LitResourceAbilityRequest[] {
    const requests: LitResourceAbilityRequest[] = [];

    config.resources.forEach(resourceId => {
      config.abilities.forEach(ability => {
        let resource;
        
        if (resourceId.startsWith('lit-action:')) {
          resource = new LitActionResource(resourceId.replace('lit-action:', ''));
        } else if (resourceId.startsWith('pkp:')) {
          resource = new LitPKPResource(resourceId.replace('pkp:', ''));
        } else {
          resource = new LitActionResource(resourceId);
        }

        requests.push({
          resource,
          ability
        });
      });
    });

    return requests;
  }

  grantPermissions(pkpPublicKey: string, permissions: ResourcePermission[]): void {
    const existing = this.permissions.get(pkpPublicKey) || [];
    const updated = [...existing];

    permissions.forEach(newPerm => {
      const existingIndex = updated.findIndex(p => 
        p.resource === newPerm.resource && p.ability === newPerm.ability
      );

      if (existingIndex >= 0) {
        updated[existingIndex] = newPerm;
      } else {
        updated.push(newPerm);
      }
    });

    this.permissions.set(pkpPublicKey, updated);
  }

  revokePermission(pkpPublicKey: string, resource: string, ability: LitAbility): boolean {
    const permissions = this.permissions.get(pkpPublicKey);
    if (!permissions) return false;

    const index = permissions.findIndex(p => 
      p.resource === resource && p.ability === ability
    );

    if (index >= 0) {
      permissions.splice(index, 1);
      return true;
    }

    return false;
  }

  hasPermission(pkpPublicKey: string, resource: string, ability: LitAbility): boolean {
    const permissions = this.permissions.get(pkpPublicKey);
    if (!permissions) return false;

    const permission = permissions.find(p => 
      p.resource === resource && p.ability === ability
    );

    if (!permission || !permission.granted) return false;

    // Check expiration
    if (permission.expiresAt && permission.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  getPermissions(pkpPublicKey: string): ResourcePermission[] {
    return this.permissions.get(pkpPublicKey) || [];
  }

  getActivePermissions(pkpPublicKey: string): ResourcePermission[] {
    const permissions = this.getPermissions(pkpPublicKey);
    const now = new Date();

    return permissions.filter(p => 
      p.granted && (!p.expiresAt || p.expiresAt > now)
    );
  }

  createAgentPermissions(pkpPublicKey: string): LitResourceAbilityRequest[] {
    return this.createResourceAbilityRequests({
      pkpPublicKey,
      abilities: [
        LitAbility.PKPSigning,
        LitAbility.LitActionExecution
      ],
      resources: [
        'lit-action:*', // All Lit Actions
        `pkp:${pkpPublicKey}` // Specific PKP
      ]
    });
  }

  createBridgePermissions(pkpPublicKey: string, chains: number[]): LitResourceAbilityRequest[] {
    const resources = chains.map(chainId => `chain:${chainId}`);
    
    return this.createResourceAbilityRequests({
      pkpPublicKey,
      abilities: [LitAbility.PKPSigning],
      resources
    });
  }

  createTimeBasedPermissions(
    pkpPublicKey: string, 
    duration: number // in milliseconds
  ): LitResourceAbilityRequest[] {
    const expiration = new Date(Date.now() + duration);
    
    return this.createResourceAbilityRequests({
      pkpPublicKey,
      abilities: [LitAbility.PKPSigning],
      resources: ['lit-action:*'],
      expiration
    });
  }

  cleanupExpiredPermissions(): void {
    const now = new Date();
    
    for (const [pkpPublicKey, permissions] of this.permissions.entries()) {
      const activePermissions = permissions.filter(p => 
        !p.expiresAt || p.expiresAt > now
      );
      
      if (activePermissions.length !== permissions.length) {
        this.permissions.set(pkpPublicKey, activePermissions);
        console.log(`Cleaned up expired permissions for PKP: ${pkpPublicKey}`);
      }
    }
  }

  exportPermissions(pkpPublicKey: string): string {
    const permissions = this.getPermissions(pkpPublicKey);
    return JSON.stringify(permissions, null, 2);
  }

  importPermissions(pkpPublicKey: string, permissionsJson: string): boolean {
    try {
      const permissions = JSON.parse(permissionsJson);
      
      // Validate structure
      if (!Array.isArray(permissions)) return false;
      
      const validPermissions = permissions.filter(p => 
        p.resource && p.ability && typeof p.granted === 'boolean'
      );
      
      this.permissions.set(pkpPublicKey, validPermissions);
      return true;
    } catch (error) {
      console.error('Failed to import permissions:', error);
      return false;
    }
  }

  getAllPKPPermissions(): Array<{ pkpPublicKey: string; permissions: ResourcePermission[] }> {
    return Array.from(this.permissions.entries()).map(([pkpPublicKey, permissions]) => ({
      pkpPublicKey,
      permissions
    }));
  }
}

export const permissionManager = new PermissionManager();