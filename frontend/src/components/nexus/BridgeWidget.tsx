'use client'

import { useState } from 'react'
import { BridgeParams, BridgeSimulation } from '../../types/nexus'
import { nexusBridge } from '../../lib/nexus/bridge'
import { SUPPORTED_NETWORKS } from '../../lib/config/networks'

interface BridgeWidgetProps {
  onBridgeInitiated?: (intentId: string) => void
  compact?: boolean
  className?: string
}

export default function BridgeWidget({ 
  onBridgeInitiated, 
  compact = false,
  className = '' 
}: BridgeWidgetProps) {
  const [params, setParams] = useState<BridgeParams>({
    fromChain: 1,
    toChain: 137,
    token: 'USDC',
    amount: ''
  })
  const [simulation, setSimulation] = useState<BridgeSimulation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supportedChains = Object.values(SUPPORTED_NETWORKS).filter(n => !n.isTestnet)
  const tokens = ['USDC', 'USDT', 'ETH']

  const handleSimulate = async () => {
    // Validate amount
    if (!params.amount || typeof params.amount !== 'string') {
      setError('Please enter a valid amount')
      return
    }
    
    const numAmount = parseFloat(params.amount)
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 1000000) {
      setError('Amount must be a positive number less than 1,000,000')
      return
    }
    
    // Validate chains are different
    if (params.fromChain === params.toChain) {
      setError('Source and destination chains must be different')
      return
    }

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

  const handleBridge = async () => {
    if (!simulation) return
    
    setLoading(true)
    try {
      const intentId = await nexusBridge.createIntent(simulation)
      onBridgeInitiated?.(intentId)
      setSimulation(null)
      setParams(prev => ({ ...prev, amount: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bridge failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`nexus-widget nexus-bridge-widget ${compact ? 'nexus-widget-compact' : ''} ${className}`}>
      <div className="nexus-widget-header">
        <h3>🌉 Cross-Chain Bridge</h3>
      </div>

      <div className="nexus-bridge-form">
        <div className="nexus-form-row">
          <div className="nexus-form-group">
            <label>From</label>
            <select
              value={params.fromChain}
              onChange={(e) => setParams(prev => ({ ...prev, fromChain: Number(e.target.value) }))}
              className="nexus-select"
            >
              {supportedChains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="nexus-bridge-arrow">→</div>
          
          <div className="nexus-form-group">
            <label>To</label>
            <select
              value={params.toChain}
              onChange={(e) => setParams(prev => ({ ...prev, toChain: Number(e.target.value) }))}
              className="nexus-select"
            >
              {supportedChains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="nexus-form-row">
          <div className="nexus-form-group">
            <label>Token</label>
            <select
              value={params.token}
              onChange={(e) => setParams(prev => ({ ...prev, token: e.target.value }))}
              className="nexus-select"
            >
              {tokens.map(token => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>
          
          <div className="nexus-form-group nexus-form-group-flex">
            <label>Amount</label>
            <input
              type="number"
              value={params.amount}
              onChange={(e) => {
                const value = e.target.value
                // Only allow valid number input
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setParams(prev => ({ ...prev, amount: value }))
                }
              }}
              placeholder="0.0"
              min="0"
              max="1000000"
              step="0.01"
              className="nexus-input"
            />
          </div>
        </div>

        {error && (
          <div className="nexus-error">
            {error}
          </div>
        )}

        <button
          onClick={handleSimulate}
          disabled={loading || !params.amount}
          className="nexus-btn nexus-btn-primary"
        >
          {loading ? 'Simulating...' : 'Preview Bridge'}
        </button>
      </div>

      {simulation && (
        <div className="nexus-simulation-result">
          <div className="nexus-simulation-header">
            <h4>Bridge Preview</h4>
          </div>
          
          <div className="nexus-simulation-details">
            <div className="nexus-detail-row">
              <span>Fee:</span>
              <span>{simulation.estimatedFees} {params.token}</span>
            </div>
            <div className="nexus-detail-row">
              <span>Time:</span>
              <span>{Math.floor(simulation.estimatedTime / 60)}m</span>
            </div>
            <div className="nexus-detail-row">
              <span>Method:</span>
              <span className={`nexus-method ${simulation.recommendedMethod}`}>
                {simulation.recommendedMethod === 'direct' ? 'Direct' : 'Chain Abstraction'}
              </span>
            </div>
          </div>

          <div className="nexus-route">
            <div className="nexus-route-label">Route:</div>
            <div className="nexus-route-path">
              {simulation.route.map((chainId, index) => (
                <span key={index}>
                  {SUPPORTED_NETWORKS[Number(chainId)]?.name}
                  {index < simulation.route.length - 1 && ' → '}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleBridge}
            disabled={loading}
            className="nexus-btn nexus-btn-success"
          >
            Execute Bridge
          </button>
        </div>
      )}
    </div>
  )
}