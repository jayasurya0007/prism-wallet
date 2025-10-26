'use client';

import { useEffect, useState } from 'react';
import { portfolioAnalytics } from '../lib/envio/portfolio-analytics';
import { nexusClient } from '../lib/nexus/client';

interface PortfolioData {
  totalValue: number;
  balancesByChain: Record<number, { balance: string; usdValue: number; token: string }>;
}

interface PortfolioOverviewProps {
  address: string;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  137: 'Polygon',
  42161: 'Arbitrum',
  43114: 'Avalanche',
  8453: 'Base',
  534351: 'Scroll',
  50104: 'Sophon',
  8217: 'Kaia',
  56: 'BNB Chain',
  9000000: 'HyperEVM'
};

export function PortfolioOverview({ address }: PortfolioOverviewProps) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolio();
    const interval = setInterval(loadPortfolio, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [address]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for demo
      const mockPortfolio: PortfolioData = {
        totalValue: 12500.50,
        balancesByChain: {
          1: { balance: '2.5', usdValue: 5000, token: 'ETH' },
          137: { balance: '3500', usdValue: 3500, token: 'USDC' },
          42161: { balance: '2000', usdValue: 2000, token: 'USDC' },
          10: { balance: '1500', usdValue: 1500, token: 'USDC' },
          8453: { balance: '500.50', usdValue: 500.50, token: 'USDC' }
        }
      };
      
      setPortfolio(mockPortfolio);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      console.error('Portfolio load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !portfolio) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">
          <p className="font-semibold">Error loading portfolio</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const chains = portfolio?.balancesByChain ? Object.entries(portfolio.balancesByChain) : [];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Portfolio Overview</h2>
          <button
            onClick={loadPortfolio}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="mt-3 sm:mt-4">
          <p className="text-xs sm:text-sm text-gray-600">Total Value</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            ${portfolio?.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">Balances by Chain</h3>
        
        {chains.length === 0 ? (
          <p className="text-gray-500 text-sm">No balances found</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {chains.map(([chainId, data]) => (
              <div key={chainId} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{CHAIN_NAMES[Number(chainId)] || `Chain ${chainId}`}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{data.balance} {data.token}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    ${data.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {((data.usdValue / (portfolio?.totalValue || 1)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
