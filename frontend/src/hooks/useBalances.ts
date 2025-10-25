'use client'

import { useState, useEffect, useCallback } from 'react';
import { balanceService } from '@/lib/nexus/balances';
import type { AggregatedBalance, TokenBalance } from '@/types/nexus';

export function useBalances(address?: string) {
  const [balances, setBalances] = useState<AggregatedBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const result = await balanceService.getUnifiedBalances(address);
      setBalances(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    loading,
    error,
    refetch: fetchBalances
  };
}

export function usePortfolioValue(address?: string) {
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    const fetchValue = async () => {
      setLoading(true);
      try {
        const value = await balanceService.getTotalPortfolioValue(address);
        setTotalValue(value);
      } catch (error) {
        console.error('Failed to fetch portfolio value:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchValue();
  }, [address]);

  return { totalValue, loading };
}

export function useChainBalances(address?: string, chainId?: number) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !chainId) return;

    const fetchBalances = async () => {
      setLoading(true);
      try {
        const result = await balanceService.getBalancesByChain(address, chainId);
        setBalances(result);
      } catch (error) {
        console.error('Failed to fetch chain balances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [address, chainId]);

  return { balances, loading };
}