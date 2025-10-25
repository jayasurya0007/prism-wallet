import { useState, useEffect, useCallback } from 'react';
import { AuthMethod } from '@lit-protocol/types';
import { pkpWalletManager, PKPInfo } from '../lib/lit/pkp-wallet';
import { sessionManager } from '../lib/lit/session-sigs';
import { litClient } from '../lib/lit/client';

interface UseLitPKPReturn {
  wallets: PKPInfo[];
  activeWallet: PKPInfo | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  createWallet: (pkpPublicKey: string, authMethods: AuthMethod[]) => Promise<void>;
  setActiveWallet: (pkpPublicKey: string) => void;
  signMessage: (message: string) => Promise<string>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useLitPKP(): UseLitPKPReturn {
  const [wallets, setWallets] = useState<PKPInfo[]>([]);
  const [activeWallet, setActiveWalletState] = useState<PKPInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWallets = useCallback(() => {
    const allWallets = pkpWalletManager.getAllWallets();
    setWallets(allWallets);
    
    const active = pkpWalletManager.getWalletInfo();
    setActiveWalletState(active);
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await litClient.connect();
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await litClient.disconnect();
      setIsConnected(false);
      sessionManager.clearAllSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, []);

  const createWallet = useCallback(async (pkpPublicKey: string, authMethods: AuthMethod[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await pkpWalletManager.createWallet({
        pkpPublicKey,
        authMethods
      });
      
      // Skip session signatures for existing PKPs
      if (authMethods && authMethods.length > 0) {
        await sessionManager.createSessionSigs({
          pkpPublicKey,
          authMethods,
          chain: 'ethereum'
        });
      }
      
      updateWallets();
    } catch (err) {
      console.error('PKP wallet creation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  }, [updateWallets]);

  const setActiveWallet = useCallback((pkpPublicKey: string) => {
    const success = pkpWalletManager.setActiveWallet(pkpPublicKey);
    if (success) {
      updateWallets();
    }
  }, [updateWallets]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!activeWallet) {
      throw new Error('No active wallet');
    }
    
    return await pkpWalletManager.signMessage(message);
  }, [activeWallet]);

  useEffect(() => {
    setIsConnected(litClient.isClientConnected());
    updateWallets();
    
    // Clean up expired sessions periodically
    const interval = setInterval(() => {
      sessionManager.clearExpiredSessions();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [updateWallets]);

  return {
    wallets,
    activeWallet,
    isConnected,
    loading,
    error,
    createWallet,
    setActiveWallet,
    signMessage,
    connect,
    disconnect
  };
}