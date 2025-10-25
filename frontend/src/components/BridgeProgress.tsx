'use client'

import { BridgeProgress } from '../types/nexus'

interface BridgeProgressProps {
  progress: BridgeProgress
  onClose?: () => void
}

export default function BridgeProgressComponent({ progress, onClose }: BridgeProgressProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'executing': return 'text-blue-600 bg-blue-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < progress.currentStep) return 'completed'
    if (stepNumber === progress.currentStep) return 'active'
    return 'pending'
  }

  const steps = [
    { number: 1, title: 'Simulation', description: 'Calculating optimal route' },
    { number: 2, title: 'Approval', description: 'Token allowance approval' },
    { number: 3, title: 'Execution', description: 'Bridge transaction' },
    { number: 4, title: 'Confirmation', description: 'Waiting for confirmations' }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Bridge Progress</h3>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(progress.status)}`}>
            {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4 mb-6">
        {steps.map((step) => {
          const status = getStepStatus(step.number)
          return (
            <div key={step.number} className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                status === 'completed' ? 'bg-green-100 text-green-600' :
                status === 'active' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {status === 'completed' ? '✓' : step.number}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${
                  status === 'active' ? 'text-blue-600' : 
                  status === 'completed' ? 'text-green-600' : 
                  'text-gray-400'
                }`}>
                  {step.title}
                </div>
                <div className="text-sm text-gray-500">{step.description}</div>
              </div>
              {status === 'active' && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          )
        })}
      </div>

      {/* Transaction Details */}
      {progress.txHash && (
        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Transaction Hash:</span>
            <a
              href={`https://etherscan.io/tx/${progress.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-mono text-sm"
            >
              {progress.txHash.slice(0, 10)}...{progress.txHash.slice(-8)}
            </a>
          </div>
          
          {progress.blockNumber && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Block Number:</span>
              <span className="font-mono text-sm">{progress.blockNumber.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Confirmations:</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{progress.confirmations}/{progress.requiredConfirmations}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.confirmations / progress.requiredConfirmations) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {progress.status === 'failed' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 text-sm">
            Bridge operation failed. Please try again or contact support.
          </div>
        </div>
      )}

      {progress.status === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800 text-sm">
            Bridge completed successfully! Your tokens should arrive shortly.
          </div>
        </div>
      )}
    </div>
  )
}