'use client'

import { useState } from 'react'
import { useBalances } from '../hooks/useBalances'

export default function DemoWallet() {
  const demoAddress = process.env.NEXT_PUBLIC_DEMO_ADDRESS || '0x742d35Cc6634C0532925a3b8D400e5e5c8C8b8b8'
  const [address, setAddress] = useState(demoAddress)
  const { balances, loading, error, refetch } = useBalances(address)

  const handleAddressChange = (newAddress: string) => {
    // Validate Ethereum address format
    if (/^0x[a-fA-F0-9]{40}$/.test(newAddress) || newAddress === '') {
      setAddress(newAddress)
    }
  }

  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Demo Wallet</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wallet Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="0x..."
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter a valid Ethereum address or use the demo address
        </p>
      </div>

      <button
        onClick={() => refetch()}
        disabled={loading || !address}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Balances'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {balances.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Balances:</h4>
          {balances.map((balance, index) => (
            <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{balance.symbol}</span>
              <span>{balance.balance} ({balance.chainId})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}