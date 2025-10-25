export interface PKPWallet {
  publicKey: string;
  address: string;
  authMethods: AuthMethod[];
}

export interface AuthMethod {
  authMethodType: number;
  accessToken: string;
}

export interface SessionSignature {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
}

export interface SigningPolicy {
  maxAmount: number;
  allowedChains: number[];
  requireGasBelow: number;
  allowedTokens: string[];
}

export interface LitActionResult {
  success: boolean;
  signedData?: string;
  error?: string;
}