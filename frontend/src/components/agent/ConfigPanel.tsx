'use client';

import { useState, useEffect } from 'react';
import { automationModes, AutomationLevel } from '../../lib/agent/automation-modes';

export function ConfigPanel() {
  const [level, setLevel] = useState<AutomationLevel>('manual');
  const [maxAmount, setMaxAmount] = useState(1000);
  const [approvalThreshold, setApprovalThreshold] = useState(500);
  const [allowedActions, setAllowedActions] = useState<string[]>(['bridge', 'rebalance', 'yield']);
  const [enabledChains, setEnabledChains] = useState<number[]>([1, 10, 137, 42161, 43114, 8453]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const config = automationModes.getConfig();
    setLevel(config.level);
    setMaxAmount(config.maxAmountPerAction);
    setApprovalThreshold(config.requireApprovalAbove);
    setAllowedActions(config.allowedActions);
    setEnabledChains(config.enabledChains);
  }, []);

  const handleSave = () => {
    try {
      automationModes.setConfig({
        level,
        maxAmountPerAction: maxAmount,
        requireApprovalAbove: approvalThreshold,
        allowedActions,
        enabledChains
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const toggleAction = (action: string) => {
    setAllowedActions(prev =>
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    );
  };

  const toggleChain = (chain: number) => {
    setEnabledChains(prev =>
      prev.includes(chain) ? prev.filter(c => c !== chain) : [...prev, chain]
    );
  };

  const chains = [
    { id: 1, name: 'Ethereum' },
    { id: 10, name: 'Optimism' },
    { id: 137, name: 'Polygon' },
    { id: 42161, name: 'Arbitrum' },
    { id: 43114, name: 'Avalanche' },
    { id: 8453, name: 'Base' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Agent Configuration</h2>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Automation Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as AutomationLevel)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="manual">Manual - Approve all actions</option>
            <option value="semi-auto">Semi-Auto - Auto-approve below threshold</option>
            <option value="full-auto">Full-Auto - Auto-approve all</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Amount Per Action: ${maxAmount}
          </label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={maxAmount}
            onChange={(e) => setMaxAmount(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approval Threshold: ${approvalThreshold}
          </label>
          <input
            type="range"
            min="0"
            max={maxAmount}
            step="50"
            value={approvalThreshold}
            onChange={(e) => setApprovalThreshold(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Actions above this amount require manual approval
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Actions
          </label>
          <div className="space-y-2">
            {['bridge', 'rebalance', 'yield'].map(action => (
              <label key={action} className="flex items-center">
                <input
                  type="checkbox"
                  checked={allowedActions.includes(action)}
                  onChange={() => toggleAction(action)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{action}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enabled Chains
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {chains.map(chain => (
              <label key={chain.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={enabledChains.includes(chain.id)}
                  onChange={() => toggleChain(chain.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-xs sm:text-sm text-gray-700">{chain.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {saved ? 'Saved ✓' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
