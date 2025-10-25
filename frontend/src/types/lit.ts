import { AuthMethod, SessionSigs } from '@lit-protocol/types';

export interface PKPWalletInfo {
  publicKey: string;
  address: string;
  tokenId: string;
  isActive: boolean;
}

export interface LitAuthConfig {
  authMethod: AuthMethod;
  pkpPublicKey?: string;
  chain?: string;
  expiration?: Date;
}

export interface LitSession {
  pkpPublicKey: string;
  chain: string;
  sessionSigs: SessionSigs;
  expiration: Date;
  isValid: boolean;
}

export interface ResourceAbility {
  resource: string;
  ability: string;
}

export interface PKPPermissions {
  allowedChains: number[];
  maxTransactionValue: string;
  allowedContracts: string[];
  timeRestrictions?: {
    startTime?: Date;
    endTime?: Date;
    allowedHours?: number[];
  };
}

export interface LitActionParams {
  code?: string;
  ipfsId?: string;
  params: Record<string, any>;
}

export interface SigningPolicy {
  maxAmount: number;
  allowedChains: number[];
  requireGasBelow: number;
  allowedTokens: string[];
  cooldownPeriod: number;
}

export interface PKPSigningRequest {
  pkpPublicKey: string;
  toSign: Uint8Array | string;
  sigName: string;
  chain?: string;
}

export interface PKPSigningResponse {
  signature: string;
  publicKey: string;
  dataSigned: string;
}