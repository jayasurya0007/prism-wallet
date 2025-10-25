import { useState, useEffect, useCallback } from 'react'
import { BridgeProgress, BridgeIntent } from '../types/nexus'
import { nexusBridge } from '../lib/nexus/bridge'

interface UseBridgeProgressReturn {
  progress: BridgeProgress | null
  intent: BridgeIntent | null
  isExecuting: boolean
  error: string | null
  executeBridge: (intentId: string) => Promise<void>
  clearProgress: () => void
}

export function useBridgeProgress(intentId?: string): UseBridgeProgressReturn {
  const [progress, setProgress] = useState<BridgeProgress | null>(null)
  const [intent, setIntent] = useState<BridgeIntent | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set up progress tracking hook
  useEffect(() => {
    nexusBridge.setHooks({
      onProgress: (newProgress) => {
        if (!intentId || newProgress.intentId === intentId) {
          setProgress(newProgress)
        }
      }
    })
  }, [intentId])

  // Load initial data if intentId provided
  useEffect(() => {
    if (intentId) {
      const existingIntent = nexusBridge.getIntent(intentId)
      const existingProgress = nexusBridge.getProgress(intentId)
      
      if (existingIntent) setIntent(existingIntent)
      if (existingProgress) setProgress(existingProgress)
    }
  }, [intentId])

  const executeBridge = useCallback(async (targetIntentId: string) => {
    setIsExecuting(true)
    setError(null)
    
    try {
      const targetIntent = nexusBridge.getIntent(targetIntentId)
      if (targetIntent) {
        setIntent(targetIntent)
      }
      
      // Validate intentId format and length
      if (!targetIntentId || typeof targetIntentId !== 'string') {
        throw new Error('Intent ID is required and must be a string')
      }
      
      if (targetIntentId.length > 100) {
        throw new Error('Intent ID too long')
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(targetIntentId)) {
        throw new Error('Invalid intent ID format')
      }
      
      await nexusBridge.executeBridge(targetIntentId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bridge execution failed')
    } finally {
      setIsExecuting(false)
    }
  }, [])

  const clearProgress = useCallback(() => {
    setProgress(null)
    setIntent(null)
    setError(null)
    setIsExecuting(false)
  }, [])

  return {
    progress,
    intent,
    isExecuting,
    error,
    executeBridge,
    clearProgress
  }
}

export function useBridgeIntentManager() {
  const [pendingIntents, setPendingIntents] = useState<BridgeIntent[]>([])
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [currentIntent, setCurrentIntent] = useState<BridgeIntent | null>(null)

  useEffect(() => {
    nexusBridge.setHooks({
      onIntent: (intent, allow, deny, refresh) => {
        setCurrentIntent(intent)
        setShowApprovalModal(true)
        
        // Store callbacks securely using non-enumerable property
        Object.defineProperty(intent, '_callbacks', {
          value: { allow, deny, refresh },
          enumerable: false,
          writable: false,
          configurable: false
        })
      }
    })
  }, [])

  const approveIntent = useCallback(() => {
    if (currentIntent && '_callbacks' in currentIntent) {
      const callbacks = (currentIntent as any)._callbacks
      if (callbacks && typeof callbacks.allow === 'function') {
        callbacks.allow()
        setShowApprovalModal(false)
        setCurrentIntent(null)
      }
    }
  }, [currentIntent])

  const denyIntent = useCallback(() => {
    if (currentIntent && '_callbacks' in currentIntent) {
      const callbacks = (currentIntent as any)._callbacks
      if (callbacks && typeof callbacks.deny === 'function') {
        callbacks.deny()
        setShowApprovalModal(false)
        setCurrentIntent(null)
      }
    }
  }, [currentIntent])

  const refreshIntent = useCallback(() => {
    if (currentIntent && '_callbacks' in currentIntent) {
      const callbacks = (currentIntent as any)._callbacks
      if (callbacks && typeof callbacks.refresh === 'function') {
        callbacks.refresh()
      }
    }
  }, [currentIntent])

  return {
    pendingIntents,
    showApprovalModal,
    currentIntent,
    approveIntent,
    denyIntent,
    refreshIntent,
    setShowApprovalModal
  }
}