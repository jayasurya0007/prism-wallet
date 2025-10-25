'use client'

import { useState } from 'react'
import { litAuth } from '../../lib/lit/auth'

interface AuthMethodSelectorProps {
  onAuthSuccess: (authMethod: any, pkpInfo?: any) => void
  onError: (error: string) => void
}

export default function AuthMethodSelector({ onAuthSuccess, onError }: AuthMethodSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleAuth = async (provider: string) => {
    setLoading(provider)
    try {
      const result = await litAuth.authenticateWithMock(provider)
      onAuthSuccess(result.authMethod, result.pkpInfo)
    } catch (error) {
      onError(error instanceof Error ? error.message : `${provider} authentication failed`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Choose Authentication Method</h4>
      
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => handleAuth('google')}
          disabled={loading === 'google'}
          className="flex items-center justify-center space-x-3 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="w-5 h-5 bg-red-500 rounded"></div>
          <span>{loading === 'google' ? 'Connecting...' : 'Mock Google Auth'}</span>
        </button>

        <button
          onClick={() => handleAuth('discord')}
          disabled={loading === 'discord'}
          className="flex items-center justify-center space-x-3 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="w-5 h-5 bg-indigo-500 rounded"></div>
          <span>{loading === 'discord' ? 'Connecting...' : 'Mock Discord Auth'}</span>
        </button>

        <button
          onClick={() => handleAuth('webauthn')}
          disabled={loading === 'webauthn'}
          className="flex items-center justify-center space-x-3 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="w-5 h-5 bg-green-500 rounded"></div>
          <span>{loading === 'webauthn' ? 'Connecting...' : 'Mock WebAuthn'}</span>
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Choose your preferred authentication method to create or access your PKP wallet
      </div>
    </div>
  )
}