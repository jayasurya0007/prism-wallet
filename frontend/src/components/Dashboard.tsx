'use client';

import { useEffect, useState } from 'react';
import { PortfolioOverview } from './PortfolioOverview';
import { TransactionHistory } from './TransactionHistory';
import { ControlPanel } from './agent/ControlPanel';
import { QuickActions } from './QuickActions';

interface DashboardProps {
  address: string;
}

export function Dashboard({ address }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      setIsLoading(false);
    }
  }, [address]);

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please connect your wallet</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <header className="mb-4 sm:mb-8 bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Wallet Agent</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 ml-13">Autonomous portfolio management across 11+ chains</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <PortfolioOverview address={address} />
            <QuickActions address={address} />
            <TransactionHistory address={address} />
          </div>
          
          <div className="lg:col-span-1">
            <ControlPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
