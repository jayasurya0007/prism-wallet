'use client'

import { useState } from 'react'
import { litAuth } from '../../lib/lit/auth'
import { ProviderType } from '@lit-protocol/constants'

interface AuthMethodSelectorProps {
  onAuthSuccess: (authMethod: any, pkpInfo?: any) => void
  onError: (error: string) => void
}

export default function AuthMethodSelector({ onAuthSuccess, onError }: AuthMethodSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleGoogleAuth = async () => {
    setLoading('google')
    try {
      const result = await litAuth.authenticateWithGoogle()
      onAuthSuccess(result.authMethod, result.pkpInfo)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Google authentication failed')
    } finally {
      setLoading(null)
    }
  }

  const handleDiscordAuth = async () => {
    setLoading('discord')
    try {
      const result = await litAuth.authenticateWithDiscord()
      onAuthSuccess(result.authMethod, result.pkpInfo)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Discord authentication failed')
    } finally {
      setLoading(null)
    }
  }

  const handleWebAuthnAuth = async () => {
    setLoading('webauthn')
    try {
      const result = await litAuth.authenticateWithWebAuthn()
      onAuthSuccess(result.authMethod, result.pkpInfo)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'WebAuthn authentication failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Choose Authentication Method</h4>
      
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={handleGoogleAuth}
          disabled={loading === 'google'}
          className="flex items-center justify-center space-x-3 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="w-5 h-5 bg-red-500 rounded"></div>
          <span>{loading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        <button
          onClick={handleDiscordAuth}
          disabled={loading === 'discord'}
          className="flex items-center justify-center space-x-3 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="w-5 h-5 bg-indigo-500 rounded"></div>
          <span>{loading === 'discord' ? 'Connecting...' : 'Continue with Discord'}</span>
        </button>

        <button
          onClick={handleWebAuthnAuth}
          disabled={loading === 'webauthn'}
          className="flex items-center justify-center space-x-3 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <div className="w-5 h-5 bg-green-500 rounded"></div>
          <span>{loading === 'webauthn' ? 'Connecting...' : 'Continue with WebAuthn'}</span>
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Choose your preferred authentication method to create or access your PKP wallet
      </div>
    </div>
  )
}