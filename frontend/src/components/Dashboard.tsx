'use client';

import { useEffect, useState } from 'react';
import { PortfolioOverview } from './PortfolioOverview';
import { TransactionHistory } from './TransactionHistory';
import { ControlPanel } from './agent/ControlPanel';

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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <header className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cross-Chain AI Wallet Agent</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Autonomous portfolio management across 11+ chains</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <PortfolioOverview address={address} />
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
