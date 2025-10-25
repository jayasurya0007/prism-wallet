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
        
        // Store callbacks for later use
        ;(intent as any)._callbacks = { allow, deny, refresh }
      }
    })
  }, [])

  const approveIntent = useCallback(() => {
    if (currentIntent && (currentIntent as any)._callbacks) {
      ;(currentIntent as any)._callbacks.allow()
      setShowApprovalModal(false)
      setCurrentIntent(null)
    }
  }, [currentIntent])

  const denyIntent = useCallback(() => {
    if (currentIntent && (currentIntent as any)._callbacks) {
      ;(currentIntent as any)._callbacks.deny()
      setShowApprovalModal(false)
      setCurrentIntent(null)
    }
  }, [currentIntent])

  const refreshIntent = useCallback(() => {
    if (currentIntent && (currentIntent as any)._callbacks) {
      ;(currentIntent as any)._callbacks.refresh()
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