'use client'

import { useState } from 'react'

export default function AgentControlPanel() {
  const [isAgentActive, setIsAgentActive] = useState(false)
  const [automationLevel, setAutomationLevel] = useState<'manual' | 'semi-auto' | 'full-auto'>('manual')

  return (
    <div className="space-y-6">
      {/* Agent Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Agent Status</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isAgentActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isAgentActive ? 'Active' : 'Inactive'}
          </div>
        </div>
        
        <button
          onClick={() => setIsAgentActive(!isAgentActive)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isAgentActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isAgentActive ? 'Stop Agent' : 'Start Agent'}
        </button>
      </div>

      {/* Automation Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Level</h3>
        <div className="space-y-3">
          {[
            { value: 'manual', label: 'Manual', description: 'Require approval for all actions' },
            { value: 'semi-auto', label: 'Semi-Automatic', description: 'Auto-execute low-risk actions' },
            { value: 'full-auto', label: 'Fully Automatic', description: 'Execute all approved strategies' }
          ].map((option) => (
            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="automation"
                value={option.value}
                checked={automationLevel === option.value}
                onChange={(e) => setAutomationLevel(e.target.value as any)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Agent Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-primary-600">0</div>
            <div className="text-sm text-gray-500">Total Actions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">$0.00</div>
            <div className="text-sm text-gray-500">Total Gains</div>
          </div>
        </div>
      </div>
    </div>
  )
}