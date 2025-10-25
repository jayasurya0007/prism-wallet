'use client'

import { useState } from 'react'
import { BridgeSimulation, BridgeParams } from '../types/nexus'
import { nexusBridge } from '../lib/nexus/bridge'
import { SUPPORTED_NETWORKS } from '../lib/config/networks'

interface BridgeSimulationProps {
  onExecute?: (intentId: string) => void;
}

export default function BridgeSimulationComponent({ onExecute }: BridgeSimulationProps) {
  const [params, setParams] = useState<BridgeParams>({
    fromChain: 1,
    toChain: 137,
    token: 'USDC',
    amount: '100'
  })
  const [simulation, setSimulation] = useState<BridgeSimulation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSimulate = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await nexusBridge.simulateBridge(params)
      setSimulation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!simulation) return
    
    setLoading(true)
    try {
      const intentId = await nexusBridge.createIntent(simulation)
      onExecute?.(intentId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed')
    } finally {
      setLoading(false)
    }
  }

  const supportedChains = Object.values(SUPPORTED_NETWORKS).filter(n => !n.isTestnet)

  return (
    <div className="card space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Bridge Simulation</h3>
      
      {/* Bridge Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Chain</label>
          <select
            value={params.fromChain}
            onChange={(e) => setParams(prev => ({ ...prev, fromChain: Number(e.target.value) }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {supportedChains.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.nativeCurrency.symbol})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To Chain</label>
          <select
            value={params.toChain}
            onChange={(e) => setParams(prev => ({ ...prev, toChain: Number(e.target.value) }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {supportedChains.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.nativeCurrency.symbol})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Token</label>
          <select
            value={params.token}
            onChange={(e) => setParams(prev => ({ ...prev, token: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="ETH">ETH</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            value={params.amount}
            onChange={(e) => setParams(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="0.0"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      <button
        onClick={handleSimulate}
        disabled={loading || !params.amount}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Simulating...' : 'Simulate Bridge'}
      </button>

      {/* Simulation Results */}
      {simulation && (
        <div className="border-t pt-6 space-y-4">
          <h4 className="font-semibold text-gray-900">Simulation Results</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Fee:</span>
                <span className="font-medium">{simulation.estimatedFees} {params.token}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Time:</span>
                <span className="font-medium">{Math.floor(simulation.estimatedTime / 60)}m {simulation.estimatedTime % 60}s</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-medium text-sm">
                  {simulation.route.map(chainId => 
                    SUPPORTED_NETWORKS[Number(chainId)]?.name || chainId
                  ).join(' → ')}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Direct Bridge</div>
                <div className="font-medium">{simulation.directCost} {params.token}</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Chain Abstraction</div>
                <div className="font-medium">{simulation.chainAbstractionCost} {params.token}</div>
              </div>
              
              <div className={`p-3 rounded-lg ${
                simulation.recommendedMethod === 'direct' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="text-sm font-medium">
                  Recommended: {simulation.recommendedMethod === 'direct' ? 'Direct Bridge' : 'Chain Abstraction'}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleExecute}
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Execute Bridge
          </button>
        </div>
      )}
    </div>
  )
}