'use client'

import { useState, useEffect } from 'react'
import { useAIAgent } from '../../hooks/useAIAgent'
import { AgentConfig } from '../../types/agent'

export default function AgentControlPanel() {
  const { 
    status, 
    decision, 
    opportunities, 
    loading, 
    error, 
    startAgent, 
    stopAgent, 
    updateConfig 
  } = useAIAgent()
  
  const [config, setConfig] = useState<Partial<AgentConfig>>({
    riskTolerance: 'moderate',
    maxTransactionAmount: 1000,
    minYieldThreshold: 5,
    gasOptimization: true,
    autoRebalance: true
  })

  const handleToggleAgent = async () => {
    if (status?.active) {
      await stopAgent()
    } else {
      await startAgent(config)
    }
  }

  const handleConfigChange = async (newConfig: Partial<AgentConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
    if (status?.active) {
      await updateConfig(newConfig)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Agent Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Agent Status</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status?.active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {status?.active ? 'Active' : 'Inactive'}
          </div>
        </div>
        
        {status?.lastAction && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Last Action:</strong> {status.lastAction}
            </div>
          </div>
        )}
        
        <button
          onClick={handleToggleAgent}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${
            status?.active
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {loading ? 'Processing...' : (status?.active ? 'Stop Agent' : 'Start Agent')}
        </button>
      </div>

      {/* Current Decision */}
      {decision && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Recommendation</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Action:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                decision.action === 'yield' ? 'bg-green-100 text-green-800' :
                decision.action === 'bridge' ? 'bg-blue-100 text-blue-800' :
                decision.action === 'rebalance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {decision.action.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Confidence:</span>
              <span>{(decision.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Est. Gain:</span>
              <span className="text-green-600">${decision.estimatedGain.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Reasoning:</strong> {decision.reasoning}
            </div>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Tolerance
            </label>
            <select
              value={config.riskTolerance}
              onChange={(e) => handleConfigChange({ riskTolerance: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Transaction Amount ($)
            </label>
            <input
              type="number"
              value={config.maxTransactionAmount}
              onChange={(e) => handleConfigChange({ maxTransactionAmount: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Yield Threshold (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={config.minYieldThreshold}
              onChange={(e) => handleConfigChange({ minYieldThreshold: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.gasOptimization}
                onChange={(e) => handleConfigChange({ gasOptimization: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Gas Optimization</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.autoRebalance}
                onChange={(e) => handleConfigChange({ autoRebalance: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Auto Rebalance</span>
            </label>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-primary-600">
              {status?.totalActions || 0}
            </div>
            <div className="text-sm text-gray-500">Total Actions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {status?.successRate?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Yield Opportunities */}
      {opportunities.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Opportunities</h3>
          <div className="space-y-3">
            {opportunities.slice(0, 3).map((opp, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{opp.protocol}</div>
                  <div className="text-sm text-gray-500">{opp.token} on Chain {opp.chainId}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{opp.apy.toFixed(1)}% APY</div>
                  <div className="text-sm text-gray-500">Risk: {opp.riskScore}/10</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}