'use client'

import { BridgeIntent, AllowanceRequest } from '../types/nexus'
import { SUPPORTED_NETWORKS } from '../lib/config/networks'

interface IntentApprovalModalProps {
  intent: BridgeIntent | null
  isOpen: boolean
  onApprove: () => void
  onDeny: () => void
  onRefresh: () => void
  onClose: () => void
}

export default function IntentApprovalModal({
  intent,
  isOpen,
  onApprove,
  onDeny,
  onRefresh,
  onClose
}: IntentApprovalModalProps) {
  if (!isOpen || !intent) return null

  const { simulation } = intent
  const fromNetwork = SUPPORTED_NETWORKS[simulation.fromChain]
  const toNetwork = SUPPORTED_NETWORKS[simulation.toChain]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Approve Bridge Intent</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Bridge Details</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>From:</span>
                <span className="font-medium">{fromNetwork?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>To:</span>
                <span className="font-medium">{toNetwork?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{simulation.amount} {simulation.token}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee:</span>
                <span className="font-medium">{simulation.estimatedFees} {simulation.token}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Time:</span>
                <span className="font-medium">
                  {Math.floor(simulation.estimatedTime / 60)}m {simulation.estimatedTime % 60}s
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> This will initiate a cross-chain bridge operation. 
              Make sure you have sufficient balance and gas fees on the source chain.
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Route: {simulation.route.map(chainId => 
              SUPPORTED_NETWORKS[Number(chainId)]?.name || chainId
            ).join(' → ')}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onDeny}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Deny
          </button>
          <button
            onClick={onRefresh}
            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
          >
            Refresh
          </button>
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}

interface AllowanceApprovalModalProps {
  request: AllowanceRequest | null
  isOpen: boolean
  onApprove: (type: 'min' | 'max' | 'exact') => void
  onDeny: () => void
  onClose: () => void
}

export function AllowanceApprovalModal({
  request,
  isOpen,
  onApprove,
  onDeny,
  onClose
}: AllowanceApprovalModalProps) {
  if (!isOpen || !request) return null

  const network = SUPPORTED_NETWORKS[request.chainId]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Token Allowance</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Allowance Request</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Token:</span>
                <span className="font-medium">{request.token}</span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="font-medium">{network?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{request.amount}</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Choose how much allowance to grant to the bridge contract:
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onApprove('min')}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="font-medium text-green-600">Minimum (Recommended)</div>
              <div className="text-sm text-gray-500">Only approve the exact amount needed</div>
            </button>
            
            <button
              onClick={() => onApprove('exact')}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="font-medium text-blue-600">Exact Amount</div>
              <div className="text-sm text-gray-500">Approve exactly {request.amount}</div>
            </button>
            
            <button
              onClick={() => onApprove('max')}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="font-medium text-yellow-600">Maximum</div>
              <div className="text-sm text-gray-500">Approve unlimited amount (not recommended)</div>
            </button>
          </div>
        </div>

        <button
          onClick={onDeny}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}