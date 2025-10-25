// Portfolio Data Hook
// Reference: https://docs.envio.dev/docs/HyperIndex/getting-started

import { useState, useEffect, useCallback } from 'react';
import { envioClient } from '../lib/envio/graphql-client';
import { portfolioAnalyzer } from '../lib/envio/portfolio-analytics';
import type { Transfer, PortfolioAnalytics } from '../types/envio';

export function usePortfolioData(address: string, chainIds: number[] = [1, 137, 42161]) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioData = useCallback(async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [transfersResponse, analyticsData] = await Promise.all([
        envioClient.getWalletActivity(address, chainIds),
        portfolioAnalyzer.analyzePortfolio(address)
      ]);
      
      setTransfers(transfersResponse.data?.Transfer || []);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
    } finally {
      setLoading(false);
    }
  }, [address, chainIds]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  return {
    transfers,
    analytics,
    loading,
    error,
    refetch: fetchPortfolioData
  };
}

export function useRecentTransfers(chainIds: number[] = [1, 137, 42161], minutes: number = 60) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await envioClient.getRecentTransfers(minutes, chainIds);
      setTransfers(response.data?.Transfer || []);
    } catch (error) {
      console.error('Failed to fetch recent transfers:', error);
    } finally {
      setLoading(false);
    }
  }, [chainIds, minutes]);

  useEffect(() => {
    fetchRecentTransfers();
    const interval = setInterval(fetchRecentTransfers, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchRecentTransfers]);

  return { transfers, loading, refetch: fetchRecentTransfers };
}

export function useHighValueTransfers(chainIds: number[] = [1, 137, 42161]) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHighValueTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await envioClient.getHighValueTransfers(undefined, 50);
      setTransfers(response.data?.Transfer || []);
    } catch (error) {
      console.error('Failed to fetch high-value transfers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHighValueTransfers();
    const interval = setInterval(fetchHighValueTransfers, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchHighValueTransfers]);

  return { transfers, loading, refetch: fetchHighValueTransfers };
}