import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { AuthMethod } from '@lit-protocol/types';
import { litClient } from './client';

export interface PKPWalletConfig {
  pkpPublicKey: string;
  authMethods: AuthMethod[];
  rpc?: string;
}

export interface PKPInfo {
  publicKey: string;
  address: string;
  tokenId: string;
}

export class PKPWalletManager {
  private wallets: Map<string, PKPEthersWallet> = new Map();
  private activeWallet: PKPEthersWallet | null = null;

  async createWallet(config: PKPWalletConfig): Promise<PKPEthersWallet> {
    await litClient.connect();
    
    // Use official PKPEthersWallet initialization from documentation
    const wallet = new PKPEthersWallet({
      litNodeClient: litClient.getClient(),
      pkpPubKey: config.pkpPublicKey,
      authMethods: config.authMethods,
      rpc: config.rpc || 'https://eth.llamarpc.com'
    });

    // Initialize wallet according to official docs
    await wallet.init();
    
    this.wallets.set(config.pkpPublicKey, wallet);
    this.activeWallet = wallet;
    
    console.log('PKP Wallet created with address:', wallet.address);
    return wallet;
  }

  async getWallet(pkpPublicKey: string): Promise<PKPEthersWallet | null> {
    return this.wallets.get(pkpPublicKey) || null;
  }

  getActiveWallet(): PKPEthersWallet | null {
    return this.activeWallet;
  }

  setActiveWallet(pkpPublicKey: string): boolean {
    const wallet = this.wallets.get(pkpPublicKey);
    if (wallet) {
      this.activeWallet = wallet;
      return true;
    }
    return false;
  }

  async signMessage(message: string, pkpPublicKey?: string): Promise<string> {
    const wallet = pkpPublicKey ? 
      this.wallets.get(pkpPublicKey) : 
      this.activeWallet;
    
    if (!wallet) {
      throw new Error('No PKP wallet available');
    }

    return await wallet.signMessage(message);
  }

  async signTransaction(transaction: any, pkpPublicKey?: string): Promise<string> {
    const wallet = pkpPublicKey ? 
      this.wallets.get(pkpPublicKey) : 
      this.activeWallet;
    
    if (!wallet) {
      throw new Error('No PKP wallet available');
    }

    return await wallet.signTransaction(transaction);
  }

  getWalletInfo(pkpPublicKey?: string): PKPInfo | null {
    const wallet = pkpPublicKey ? 
      this.wallets.get(pkpPublicKey) : 
      this.activeWallet;
    
    if (!wallet) {
      return null;
    }

    return {
      publicKey: wallet.pkpPubKey,
      address: wallet.address,
      tokenId: wallet.pkpPubKey // Simplified for demo
    };
  }

  getAllWallets(): PKPInfo[] {
    return Array.from(this.wallets.values()).map(wallet => ({
      publicKey: wallet.pkpPubKey,
      address: wallet.address,
      tokenId: wallet.pkpPubKey
    }));
  }

  async removeWallet(pkpPublicKey: string): Promise<boolean> {
    const wallet = this.wallets.get(pkpPublicKey);
    if (wallet) {
      this.wallets.delete(pkpPublicKey);
      if (this.activeWallet === wallet) {
        this.activeWallet = null;
      }
      return true;
    }
    return false;
  }
}

export const pkpWalletManager = new PKPWalletManager();