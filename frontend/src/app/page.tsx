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
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-white/90 text-sm font-medium">Powered by AI • Live on 11+ Chains</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Cross-Chain</span>
              <br />
              <span className="text-white">AI Wallet Agent</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Autonomous portfolio management across 11+ chains with AI-powered optimization
            </p>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-full border border-blue-400/30">
                <span className="text-blue-300 font-semibold text-sm">🌉 Avail Nexus</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-full border border-purple-400/30">
                <span className="text-purple-300 font-semibold text-sm">🔐 Lit Protocol</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-pink-600/20 backdrop-blur-sm rounded-full border border-pink-400/30">
                <span className="text-pink-300 font-semibold text-sm">⚡ Envio HyperSync</span>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-md mx-auto space-y-4">
            <button
              onClick={() => handleAuth('0x4a8e1aF0Cd577889faF75B307721B0B91Ecd9AdB')}
              className="group w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                🚀 Launch Demo
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-slate-900 text-gray-400 font-medium">or connect with PKP</span>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <PKPAuth onAuthenticated={handleAuth} />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-white font-bold text-lg mb-2">AI-Powered</h3>
              <p className="text-gray-400 text-sm">Autonomous decision-making for optimal portfolio management</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-white font-bold text-lg mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Real-time data with Envio HyperSync across all chains</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-white font-bold text-lg mb-2">Secure</h3>
              <p className="text-gray-400 text-sm">Programmable signing policies with Lit Protocol PKP</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/20 px-4 sm:px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Connected</div>
              <div className="text-sm font-mono font-bold text-white">{address.slice(0, 6)}...{address.slice(-4)}</div>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-all border border-red-500/20"
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <Dashboard address={address} />
    </main>
  );
}