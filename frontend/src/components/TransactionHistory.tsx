'use client';

import { useEffect, useState } from 'react';
import { graphqlClient } from '../lib/envio/graphql-client';

interface Transaction {
  id: string;
  type: 'bridge' | 'transfer' | 'swap';
  from: string;
  to: string;
  amount: string;
  token: string;
  chainId: number;
  timestamp: number;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
}

interface TransactionHistoryProps {
  address: string;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  137: 'Polygon',
  42161: 'Arbitrum',
  43114: 'Avalanche',
  8453: 'Base'
};

export function TransactionHistory({ address }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
    const interval = setInterval(loadTransactions, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [address]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock transactions for demo
      const mockTxs: Transaction[] = [
        {
          id: '1',
          type: 'bridge',
          from: address,
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          amount: '1000',
          token: 'USDC',
          chainId: 1,
          timestamp: Math.floor(Date.now() / 1000) - 3600,
          txHash: '0x123...',
          status: 'completed'
        },
        {
          id: '2',
          type: 'transfer',
          from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          to: address,
          amount: '500',
          token: 'USDC',
          chainId: 137,
          timestamp: Math.floor(Date.now() / 1000) - 7200,
          txHash: '0x456...',
          status: 'completed'
        },
        {
          id: '3',
          type: 'swap',
          from: address,
          to: address,
          amount: '250',
          token: 'USDC',
          chainId: 42161,
          timestamp: Math.floor(Date.now() / 1000) - 86400,
          txHash: '0x789...',
          status: 'completed'
        }
      ];
      
      setTransactions(mockTxs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      console.error('Transaction load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = Date.now();
    const diff = now - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Transaction History</h2>
          <button
            onClick={loadTransactions}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {error ? (
          <div className="p-6 text-red-600">
            <p className="text-sm">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'bridge' ? 'bg-blue-100' :
                    tx.type === 'swap' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    <span className="text-xs sm:text-sm">
                      {tx.type === 'bridge' ? '🌉' : tx.type === 'swap' ? '🔄' : '📤'}
                    </span>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <p className="text-sm sm:text-base font-medium text-gray-900 capitalize">{tx.type}</p>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded whitespace-nowrap">
                        {CHAIN_NAMES[tx.chainId] || `Chain ${tx.chainId}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 mt-1 text-xs sm:text-sm text-gray-600">
                      <span className="truncate">{formatAddress(tx.from)}</span>
                      <span className="flex-shrink-0">→</span>
                      <span className="truncate">{formatAddress(tx.to)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm sm:text-base font-semibold text-gray-900 whitespace-nowrap">
                    {parseFloat(tx.amount).toLocaleString()} {tx.token}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(tx.timestamp)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
