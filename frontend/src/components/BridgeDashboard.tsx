'use client'

import { useState } from 'react'
import BridgeSimulation from './BridgeSimulation'
import BridgeProgress from './BridgeProgress'
import IntentApprovalModal, { AllowanceApprovalModal } from './IntentApprovalModal'
import { useBridgeProgress, useBridgeIntentManager } from '../hooks/useBridgeProgress'
import { nexusBridge } from '../lib/nexus/bridge'
import { AllowanceRequest } from '../types/nexus'

export default function BridgeDashboard() {
  const [activeIntentId, setActiveIntentId] = useState<string | null>(null)
  const [showAllowanceModal, setShowAllowanceModal] = useState(false)
  const [currentAllowanceRequest, setCurrentAllowanceRequest] = useState<AllowanceRequest | null>(null)
  
  const { progress, intent, isExecuting, error, executeBridge, clearProgress } = useBridgeProgress(activeIntentId || undefined)
  
  const {
    showApprovalModal,
    currentIntent,
    approveIntent,
    denyIntent,
    refreshIntent,
    setShowApprovalModal
  } = useBridgeIntentManager()

  // Set up allowance hook
  useState(() => {
    nexusBridge.setHooks({
      onAllowance: (request, allow, deny) => {
        setCurrentAllowanceRequest(request)
        setShowAllowanceModal(true)
        
        // Store callbacks
        ;(request as any)._callbacks = { allow, deny }
      }
    })
  })

  const handleExecuteFromSimulation = async (intentId: string) => {
    setActiveIntentId(intentId)
    await executeBridge(intentId)
  }

  const handleAllowanceApproval = (type: 'min' | 'max' | 'exact') => {
    if (currentAllowanceRequest && (currentAllowanceRequest as any)._callbacks) {
      ;(currentAllowanceRequest as any)._callbacks.allow(type)
      setShowAllowanceModal(false)
      setCurrentAllowanceRequest(null)
    }
  }

  const handleAllowanceDeny = () => {
    if (currentAllowanceRequest && (currentAllowanceRequest as any)._callbacks) {
      ;(currentAllowanceRequest as any)._callbacks.deny()
      setShowAllowanceModal(false)
      setCurrentAllowanceRequest(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Cross-Chain Bridge</h2>
        {progress && (
          <button
            onClick={clearProgress}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Clear Progress
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bridge Simulation */}
        <BridgeSimulation onExecute={handleExecuteFromSimulation} />
        
        {/* Bridge Progress */}
        {progress && (
          <BridgeProgress 
            progress={progress} 
            onClose={clearProgress}
          />
        )}
      </div>

      {/* Recent Bridge Operations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Operations</h3>
        <div className="space-y-3">
          {nexusBridge.getAllIntents().slice(-5).map((intent) => (
            <div key={intent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  intent.status === 'completed' ? 'bg-green-500' :
                  intent.status === 'failed' ? 'bg-red-500' :
                  intent.status === 'executing' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`} />
                <div>
                  <div className="font-medium">
                    {intent.simulation.amount} {intent.simulation.token}
                  </div>
                  <div className="text-sm text-gray-500">
                    Chain {intent.simulation.fromChain} → Chain {intent.simulation.toChain}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium capitalize">{intent.status}</div>
                <div className="text-xs text-gray-500">
                  {intent.createdAt.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {nexusBridge.getAllIntents().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">No bridge operations yet</div>
              <div className="text-sm">Start by simulating a bridge above</div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <IntentApprovalModal
        intent={currentIntent}
        isOpen={showApprovalModal}
        onApprove={approveIntent}
        onDeny={denyIntent}
        onRefresh={refreshIntent}
        onClose={() => setShowApprovalModal(false)}
      />

      <AllowanceApprovalModal
        request={currentAllowanceRequest}
        isOpen={showAllowanceModal}
        onApprove={handleAllowanceApproval}
        onDeny={handleAllowanceDeny}
        onClose={() => setShowAllowanceModal(false)}
      />
    </div>
  )
}