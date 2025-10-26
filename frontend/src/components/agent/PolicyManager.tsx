'use client';

import { useState, useEffect } from 'react';
import { policyEngine } from '../../lib/lit/policy-engine';

interface Policy {
  id: string;
  name: string;
  type: 'spending_limit' | 'time_restriction' | 'chain_restriction';
  enabled: boolean;
  config: any;
}

export function PolicyManager() {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: '1',
      name: 'Daily Spending Limit',
      type: 'spending_limit',
      enabled: true,
      config: { limit: 1000, period: 'daily' }
    },
    {
      id: '2',
      name: 'Business Hours Only',
      type: 'time_restriction',
      enabled: false,
      config: { start: '09:00', end: '17:00' }
    },
    {
      id: '3',
      name: 'Mainnet Chains Only',
      type: 'chain_restriction',
      enabled: true,
      config: { allowedChains: [1, 10, 137, 42161, 43114, 8453] }
    }
  ]);

  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyType, setNewPolicyType] = useState<Policy['type']>('spending_limit');
  const [showAddForm, setShowAddForm] = useState(false);

  const togglePolicy = (id: string) => {
    setPolicies(prev =>
      prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const deletePolicy = (id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  const addPolicy = () => {
    if (!newPolicyName) return;

    const newPolicy: Policy = {
      id: Date.now().toString(),
      name: newPolicyName,
      type: newPolicyType,
      enabled: true,
      config: {}
    };

    setPolicies(prev => [...prev, newPolicy]);
    setNewPolicyName('');
    setShowAddForm(false);
  };

  const getPolicyIcon = (type: Policy['type']) => {
    switch (type) {
      case 'spending_limit': return '💰';
      case 'time_restriction': return '⏰';
      case 'chain_restriction': return '🔗';
      default: return '📋';
    }
  };

  const getPolicyDescription = (policy: Policy) => {
    switch (policy.type) {
      case 'spending_limit':
        return `Max $${policy.config.limit} per ${policy.config.period}`;
      case 'time_restriction':
        return `Active ${policy.config.start} - ${policy.config.end}`;
      case 'chain_restriction':
        return `${policy.config.allowedChains?.length || 0} chains allowed`;
      default:
        return 'Custom policy';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Policy Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
        >
          {showAddForm ? 'Cancel' : '+ Add Policy'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Policy name"
            value={newPolicyName}
            onChange={(e) => setNewPolicyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={newPolicyType}
            onChange={(e) => setNewPolicyType(e.target.value as Policy['type'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="spending_limit">Spending Limit</option>
            <option value="time_restriction">Time Restriction</option>
            <option value="chain_restriction">Chain Restriction</option>
          </select>
          <button
            onClick={addPolicy}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Policy
          </button>
        </div>
      )}

      <div className="space-y-3">
        {policies.length === 0 ? (
          <p className="text-gray-500 text-xs sm:text-sm text-center py-4">No policies configured</p>
        ) : (
          policies.map(policy => (
            <div
              key={policy.id}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                policy.enabled
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{getPolicyIcon(policy.type)}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{policy.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {getPolicyDescription(policy)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <button
                    onClick={() => togglePolicy(policy.id)}
                    className={`px-2 sm:px-3 py-1 rounded text-xs font-medium ${
                      policy.enabled
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {policy.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => deletePolicy(policy.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Policies are enforced by Lit Protocol PKP before any action execution.
        </p>
      </div>
    </div>
  );
}
