'use client';

import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import PKPAuth from '@/components/auth/PKPAuth';

export default function Home() {
  const [address, setAddress] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuth = (pkpAddress: string) => {
    setAddress(pkpAddress);
    setIsAuthenticated(true);
    localStorage.setItem('wallet_address', pkpAddress);
  };

  const handleDisconnect = () => {
    setAddress('');
    setIsAuthenticated(false);
    localStorage.removeItem('wallet_address');
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Cross-Chain AI Wallet Agent
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Autonomous portfolio management powered by Avail Nexus, Lit Protocol, and Envio
            </p>
          </div>
          
          <div className="max-w-md mx-auto space-y-4">
            <button
              onClick={() => {
                const demoAddress = '0x4a8e1aF0Cd577889faF75B307721B0B91Ecd9AdB';
                handleAuth(demoAddress);
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Enter Demo Mode
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">or connect with PKP</span>
              </div>
            </div>
            
            <PKPAuth onAuthenticated={handleAuth} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-gray-600 truncate">Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-xs sm:text-sm text-red-600 hover:text-red-700 flex-shrink-0 ml-2"
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <Dashboard address={address} />
    </main>
  );
}