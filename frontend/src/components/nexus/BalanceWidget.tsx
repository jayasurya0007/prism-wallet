'use client'

import { useState, useEffect } from 'react'
import { TokenBalance, AggregatedBalance } from '../../types/nexus'
import { nexusClient } from '../../lib/nexus/client'
import { SUPPORTED_NETWORKS } from '../../lib/config/networks'

interface BalanceWidgetProps {
  address?: string
  showAggregated?: boolean
  compact?: boolean
  className?: string
}

export default function BalanceWidget({ 
  address, 
  showAggregated = false, 
  compact = false,
  className = '' 
}: BalanceWidgetProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [aggregated, setAggregated] = useState<AggregatedBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (address) {
      fetchBalances()
    }
  }, [address])

  const fetchBalances = async () => {
    if (!address) return
    
    setLoading(true)
    setError(null)
    
    try {
      if (showAggregated) {
        const aggBalances = await nexusClient.getAggregatedBalances(address)
        setAggregated(aggBalances)
      } else {
        const tokenBalances = await nexusClient.getBalances(address)
        setBalances(tokenBalances)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances')
    } finally {
      setLoading(false)
    }
  }

  const formatBalance = (balance: string, decimals: number) => {
    const value = parseFloat(balance) / Math.pow(10, decimals)
    return value.toFixed(value < 1 ? 6 : 2)
  }

  const getChainIcon = (chainId: number) => {
    const network = SUPPORTED_NETWORKS[chainId]
    return network?.nativeCurrency.symbol.slice(0, 2) || '??'
  }

  if (!address) {
    return (
      <div className={`nexus-widget ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">Connect Wallet</div>
          <div className="text-sm">Connect your wallet to view balances</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`nexus-widget ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading balances...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`nexus-widget ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading balances</div>
          <div className="text-sm text-gray-500">{error}</div>
          <button 
            onClick={fetchBalances}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (showAggregated) {
    return (
      <div className={`nexus-widget ${className}`}>
        <div className="nexus-widget-header">
          <h3>Portfolio Overview</h3>
          <button onClick={fetchBalances} className="nexus-refresh-btn">↻</button>
        </div>
        
        <div className="nexus-balance-list">
          {aggregated.map((agg, index) => (
            <div key={index} className="nexus-balance-item">
              <div className="nexus-token-info">
                <div className="nexus-token-icon">{agg.symbol}</div>
                <div>
                  <div className="nexus-token-symbol">{agg.symbol}</div>
                  <div className="nexus-token-chains">
                    {Object.keys(agg.balancesByChain).length} chains
                  </div>
                </div>
              </div>
              <div className="nexus-balance-amount">
                <div className="nexus-balance-value">
                  {formatBalance(agg.totalBalance, 18)}
                </div>
                <div className="nexus-balance-usd">
                  ${agg.totalUsdValue.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`nexus-widget ${compact ? 'nexus-widget-compact' : ''} ${className}`}>
      <div className="nexus-widget-header">
        <h3>Token Balances</h3>
        <button onClick={fetchBalances} className="nexus-refresh-btn">↻</button>
      </div>
      
      <div className="nexus-balance-list">
        {balances.filter(b => parseFloat(b.balance) > 0).map((balance, index) => (
          <div key={index} className="nexus-balance-item">
            <div className="nexus-token-info">
              <div className="nexus-chain-icon">
                {getChainIcon(balance.chainId)}
              </div>
              <div>
                <div className="nexus-token-symbol">{balance.symbol}</div>
                <div className="nexus-chain-name">
                  {SUPPORTED_NETWORKS[balance.chainId]?.name}
                </div>
              </div>
            </div>
            <div className="nexus-balance-amount">
              <div className="nexus-balance-value">
                {formatBalance(balance.balance, balance.decimals)}
              </div>
              {balance.usdValue && (
                <div className="nexus-balance-usd">
                  ${balance.usdValue.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {balances.filter(b => parseFloat(b.balance) > 0).length === 0 && (
          <div className="nexus-empty-state">
            <div>No tokens found</div>
            <div className="text-sm">Your balances will appear here</div>
          </div>
        )}
      </div>
    </div>
  )
}