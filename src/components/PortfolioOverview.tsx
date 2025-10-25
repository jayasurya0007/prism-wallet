'use client'

import { useState } from 'react';
import { useBalances, usePortfolioValue } from '@/hooks/useBalances';
import { SUPPORTED_NETWORKS } from '@/lib/config/networks';

export default function PortfolioOverview() {
  const [walletAddress] = useState<string>(); // Will be connected via wallet
  const { balances, loading: balancesLoading } = useBalances(walletAddress);
  const { totalValue, loading: valueLoading } = usePortfolioValue(walletAddress);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getChainDistribution = () => {
    const distribution: Record<number, number> = {};
    balances.forEach(balance => {
      Object.entries(balance.balancesByChain).forEach(([chainId, chainBalance]) => {
        const id = parseInt(chainId);
        distribution[id] = (distribution[id] || 0) + (chainBalance.usdValue || 0);
      });
    });
    return distribution;
  };

  const chainDistribution = getChainDistribution();
  const topChains = Object.entries(chainDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Portfolio Value */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Portfolio</h3>
        <p className="text-3xl font-bold text-primary-600">
          {valueLoading ? 'Loading...' : formatCurrency(totalValue)}
        </p>
        <p className="text-sm text-gray-500 mt-1">Across {Object.keys(chainDistribution).length} chains</p>
      </div>

      {/* Chain Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chain Distribution</h3>
        <div className="space-y-2">
          {topChains.length > 0 ? (
            topChains.map(([chainId, value]) => {
              const network = SUPPORTED_NETWORKS[parseInt(chainId)];
              return (
                <div key={chainId} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{network?.name || `Chain ${chainId}`}</span>
                  <span className="text-sm font-medium">{formatCurrency(value)}</span>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500">No balances found</div>
          )}
        </div>
      </div>

      {/* Top Tokens */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Tokens</h3>
        <div className="space-y-2">
          {balancesLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : balances.length > 0 ? (
            balances.slice(0, 3).map(balance => (
              <div key={balance.symbol} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{balance.symbol}</span>
                <span className="text-sm font-medium">{formatCurrency(balance.totalUsdValue)}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">Connect wallet to view tokens</div>
          )}
        </div>
      </div>

      {/* Balance Summary */}
      <div className="card md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Summary</h3>
        {balancesLoading ? (
          <div className="text-sm text-gray-500">Loading balances...</div>
        ) : balances.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.map(balance => (
              <div key={balance.symbol} className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium text-gray-900">{balance.symbol}</div>
                <div className="text-sm text-gray-600">{formatCurrency(balance.totalUsdValue)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {Object.keys(balance.balancesByChain).length} chains
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No wallet connected</div>
            <div className="text-sm text-gray-400">Connect your wallet to view cross-chain balances</div>
          </div>
        )}
      </div>
    </div>
  )
}