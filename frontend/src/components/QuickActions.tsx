'use client';

import { useState } from 'react';

interface QuickActionsProps {
  address: string;
}

export function QuickActions({ address }: QuickActionsProps) {
  const [activeAction, setActiveAction] = useState<'bridge' | 'transfer' | 'swap' | null>(null);
  const [fromChain, setFromChain] = useState('1');
  const [toChain, setToChain] = useState('137');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const chains = [
    { id: '1', name: 'Ethereum' },
    { id: '10', name: 'Optimism' },
    { id: '137', name: 'Polygon' },
    { id: '42161', name: 'Arbitrum' },
    { id: '8453', name: 'Base' }
  ];

  const handleExecute = () => {
    alert(`${activeAction} action would be executed here with Avail Nexus SDK`);
    setActiveAction(null);
    setAmount('');
    setRecipient('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setActiveAction('bridge')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            activeAction === 'bridge'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="text-2xl mb-2">🌉</div>
          <div className="text-sm font-medium">Bridge</div>
        </button>

        <button
          onClick={() => setActiveAction('transfer')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            activeAction === 'transfer'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <div className="text-2xl mb-2">📤</div>
          <div className="text-sm font-medium">Transfer</div>
        </button>

        <button
          onClick={() => setActiveAction('swap')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            activeAction === 'swap'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="text-2xl mb-2">🔄</div>
          <div className="text-sm font-medium">Swap</div>
        </button>
      </div>

      {activeAction === 'bridge' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900">Bridge Assets</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Chain</label>
            <select
              value={fromChain}
              onChange={(e) => setFromChain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Chain</label>
            <select
              value={toChain}
              onChange={(e) => setToChain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USDC)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExecute}
              disabled={!amount}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Bridge via Avail Nexus
            </button>
            <button
              onClick={() => setActiveAction(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeAction === 'transfer' && (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-900">Transfer Assets</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chain</label>
            <select
              value={fromChain}
              onChange={(e) => setFromChain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USDC)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExecute}
              disabled={!amount || !recipient}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Transfer
            </button>
            <button
              onClick={() => setActiveAction(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeAction === 'swap' && (
        <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium text-purple-900">Swap Assets</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chain</label>
            <select
              value={fromChain}
              onChange={(e) => setFromChain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Token</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>USDC</option>
              <option>USDT</option>
              <option>ETH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Token</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>ETH</option>
              <option>USDC</option>
              <option>USDT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExecute}
              disabled={!amount}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Swap
            </button>
            <button
              onClick={() => setActiveAction(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!activeAction && (
        <p className="text-sm text-gray-500 text-center">
          Select an action above to get started
        </p>
      )}
    </div>
  );
}
