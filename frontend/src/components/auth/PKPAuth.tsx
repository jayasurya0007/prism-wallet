'use client'

import { useState } from 'react'
import { useLitPKP } from '../../hooks/useLitPKP'
import PolicyManager from '../lit/PolicyManager'
import AuthMethodSelector from './AuthMethodSelector'
import PermissionManager from './PermissionManager'

export default function PKPAuth() {
  const {
    wallets,
    activeWallet,
    isConnected,
    loading,
    error,
    createWallet,
    setActiveWallet,
    connect,
    disconnect
  } = useLitPKP()

  const [pkpPublicKey, setPkpPublicKey] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleConnect = async () => {
    await connect()
  }

  const handleCreateWallet = async () => {
    if (!pkpPublicKey.trim()) return
    
    // PKP wallet creation requires OAuth authentication flow
    // Reference: https://developer.litprotocol.com/user-wallets/pkps/overview
    alert('PKP wallet creation requires OAuth authentication. Use the PKP Test section above to validate your PKP.')
    setShowCreateForm(false)
  }

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">PKP Authentication</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Debug Info */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
        <div>PKP Key: {process.env.NEXT_PUBLIC_LIT_PKP_PUBLIC_KEY ? 'Found' : 'Not Found'}</div>
        <div>Token ID: {process.env.NEXT_PUBLIC_LIT_TOKEN_ID ? 'Found' : 'Not Found'}</div>
        <div>Network: {process.env.NEXT_PUBLIC_LIT_NETWORK || 'Not Set'}</div>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">Connect to Lit Protocol to manage PKP wallets</div>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect to Lit Protocol'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Wallet */}
          {activeWallet && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Active PKP Wallet</div>
              <div className="font-mono text-sm text-blue-800">
                {activeWallet.address}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Public Key: {activeWallet.publicKey.slice(0, 20)}...
              </div>
            </div>
          )}

          {/* Wallet List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">PKP Wallets</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const envPkp = process.env.NEXT_PUBLIC_LIT_PKP_PUBLIC_KEY;
                    if (envPkp) {
                      setPkpPublicKey(envPkp);
                      setShowCreateForm(true);
                    }
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Load My PKP
                </button>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add PKP
                </button>
              </div>
            </div>

            {showCreateForm && (
              <div className="p-4 border border-gray-200 rounded-lg mb-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PKP Public Key
                    </label>
                    <input
                      type="text"
                      value={pkpPublicKey}
                      onChange={(e) => setPkpPublicKey(e.target.value)}
                      placeholder="0x04..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateWallet}
                      disabled={loading || !pkpPublicKey.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Wallet'}
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {wallets.map((wallet) => (
                <div
                  key={wallet.publicKey}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    activeWallet?.publicKey === wallet.publicKey
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveWallet(wallet.publicKey)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm font-medium">
                        {wallet.address}
                      </div>
                      <div className="text-xs text-gray-500">
                        {wallet.publicKey.slice(0, 20)}...
                      </div>
                    </div>
                    {activeWallet?.publicKey === wallet.publicKey && (
                      <div className="text-blue-600 text-sm font-medium">Active</div>
                    )}
                  </div>
                </div>
              ))}

              {wallets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">No PKP wallets</div>
                  <div className="text-sm">Add a PKP wallet to get started</div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={disconnect}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
      
      {/* Auth Method Selector */}
      {isConnected && !activeWallet && (
        <div className="mt-6">
          <AuthMethodSelector />
        </div>
      )}
      
      {/* Policy Management */}
      {isConnected && activeWallet && (
        <div className="mt-6">
          <PolicyManager />
        </div>
      )}
      
      {/* Permission Management */}
      {isConnected && activeWallet && (
        <div className="mt-6">
          <PermissionManager />
        </div>
      )}
    </div>
  )
}