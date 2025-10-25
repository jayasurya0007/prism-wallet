'use client'

import { useState, useEffect } from 'react'
import { SigningPolicy } from '../../types/lit'
import { policyEngine } from '../../lib/lit/policy-engine'
import { autonomousSigner } from '../../lib/lit/autonomous-signer'
import { useLitPKP } from '../../hooks/useLitPKP'

export default function PolicyManager() {
  const { activeWallet } = useLitPKP()
  const [policy, setPolicy] = useState<SigningPolicy | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPolicy, setEditedPolicy] = useState<SigningPolicy | null>(null)

  useEffect(() => {
    if (activeWallet) {
      const existingPolicy = policyEngine.getPolicy(activeWallet.publicKey)
      if (existingPolicy) {
        setPolicy(existingPolicy)
      } else {
        const defaultPolicy = policyEngine.createDefaultPolicy()
        setPolicy(defaultPolicy)
        policyEngine.setPolicy(activeWallet.publicKey, defaultPolicy)
      }
    }
  }, [activeWallet])

  const handleEdit = () => {
    setEditedPolicy(policy ? { ...policy } : policyEngine.createDefaultPolicy())
    setIsEditing(true)
  }

  const handleSave = () => {
    if (activeWallet && editedPolicy) {
      policyEngine.setPolicy(activeWallet.publicKey, editedPolicy)
      setPolicy(editedPolicy)
      setIsEditing(false)
      
      // Setup Lit Action with new policy
      autonomousSigner.setupDefaultLitAction()
    }
  }

  const handleCancel = () => {
    setEditedPolicy(null)
    setIsEditing(false)
  }

  const updateEditedPolicy = (field: keyof SigningPolicy, value: any) => {
    if (editedPolicy) {
      setEditedPolicy({ ...editedPolicy, [field]: value })
    }
  }

  if (!activeWallet) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">No Active PKP Wallet</div>
          <div className="text-sm">Connect a PKP wallet to manage signing policies</div>
        </div>
      </div>
    )
  }

  const currentPolicy = isEditing ? editedPolicy : policy

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Signing Policy</h3>
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Policy
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Policy
              </button>
            </>
          )}
        </div>
      </div>

      {currentPolicy && (
        <div className="space-y-4">
          {/* Max Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Transaction Amount (USDC)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={currentPolicy.maxAmount}
                onChange={(e) => updateEditedPolicy('maxAmount', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg">{currentPolicy.maxAmount} USDC</div>
            )}
          </div>

          {/* Allowed Chains */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Chains
            </label>
            {isEditing ? (
              <div className="space-y-2">
                {[1, 10, 137, 42161, 43114, 8453].map(chainId => (
                  <label key={chainId} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={currentPolicy.allowedChains.includes(chainId)}
                      onChange={(e) => {
                        const newChains = e.target.checked
                          ? [...currentPolicy.allowedChains, chainId]
                          : currentPolicy.allowedChains.filter(id => id !== chainId)
                        updateEditedPolicy('allowedChains', newChains)
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">Chain {chainId}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                {currentPolicy.allowedChains.join(', ')}
              </div>
            )}
          </div>

          {/* Gas Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Gas Price (Gwei)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={currentPolicy.requireGasBelow}
                onChange={(e) => updateEditedPolicy('requireGasBelow', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg">{currentPolicy.requireGasBelow} Gwei</div>
            )}
          </div>

          {/* Allowed Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Tokens
            </label>
            {isEditing ? (
              <div className="space-y-2">
                {['USDC', 'USDT', 'ETH', 'WETH'].map(token => (
                  <label key={token} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={currentPolicy.allowedTokens.includes(token)}
                      onChange={(e) => {
                        const newTokens = e.target.checked
                          ? [...currentPolicy.allowedTokens, token]
                          : currentPolicy.allowedTokens.filter(t => t !== token)
                        updateEditedPolicy('allowedTokens', newTokens)
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{token}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                {currentPolicy.allowedTokens.join(', ')}
              </div>
            )}
          </div>

          {/* Cooldown Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooldown Period (seconds)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={currentPolicy.cooldownPeriod}
                onChange={(e) => updateEditedPolicy('cooldownPeriod', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg">{currentPolicy.cooldownPeriod} seconds</div>
            )}
          </div>
        </div>
      )}

      {/* Policy Status */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="mb-2">
            <strong>PKP Wallet:</strong> {activeWallet.address}
          </div>
          <div>
            <strong>Policy Status:</strong> 
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}