'use client'

import { useState, useEffect } from 'react'
import { useAIAgent } from '../../hooks/useAIAgent'
import { useBalances } from '../../hooks/useBalances'

export default function PortfolioAnalysis() {
  const { decision, analyzePortfolio, loading, error } = useAIAgent()
  const { balances, totalValue } = useBalances()
  const [autoAnalyze, setAutoAnalyze] = useState(false)

  useEffect(() => {
    if (autoAnalyze && balances.length > 0) {
      const interval = setInterval(() => {
        analyzePortfolio({
          balances: balances.map(b => ({
            chainId: b.chainId,
            symbol: b.symbol,
            balance: b.balance,
            usdValue: b.usdValue || 0
          })),
          totalValue
        })
      }, 30000) // Analyze every 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoAnalyze, balances, totalValue, analyzePortfolio])

  const handleManualAnalysis = () => {
    if (balances.length === 0) return
    
    analyzePortfolio({
      balances: balances.map(b => ({
        chainId: b.chainId,
        symbol: b.symbol,
        balance: b.balance,
        usdValue: b.usdValue || 0
      })),
      totalValue
    })
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'yield': return '🌱'
      case 'bridge': return '🌉'
      case 'rebalance': return '⚖️'
      case 'hold': return '🤝'
      default: return '❓'
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Analysis</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoAnalyze}
                onChange={(e) => setAutoAnalyze(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Auto-analyze</span>
            </label>
            <button
              onClick={handleManualAnalysis}
              disabled={loading || balances.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze Now'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {balances.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">No portfolio data available</div>
            <div className="text-sm">Connect your wallet to start analysis</div>
          </div>
        )}
      </div>

      {/* Current Analysis Result */}
      {decision && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            AI Recommendation {getActionIcon(decision.action)}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Action:</span>
                <span className="font-semibold capitalize">{decision.action}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confidence:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${decision.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {(decision.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Risk Level:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(decision.riskLevel)}`}>
                  {decision.riskLevel.toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Est. 30-day Gain:</span>
                <span className="font-bold text-green-600">
                  ${decision.estimatedGain.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-gray-600 block mb-2">Reasoning:</span>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  {decision.reasoning}
                </div>
              </div>
              
              {decision.targetChain && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Target Chain:</span>
                  <span className="font-medium">Chain {decision.targetChain}</span>
                </div>
              )}
              
              {decision.targetToken && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Target Token:</span>
                  <span className="font-medium">{decision.targetToken}</span>
                </div>
              )}
            </div>
          </div>
          
          {decision.action !== 'hold' && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Execute Recommendation
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Simulate First
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Distribution */}
      {balances.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Distribution</h3>
          
          <div className="space-y-3">
            {balances.map((balance, index) => {
              const percentage = totalValue > 0 ? ((balance.usdValue || 0) / totalValue) * 100 : 0
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {balance.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{balance.symbol}</div>
                      <div className="text-sm text-gray-500">Chain {balance.chainId}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">${(balance.usdValue || 0).toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Portfolio Value:</span>
              <span className="text-xl font-bold text-blue-600">${totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}