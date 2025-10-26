'use client'

import { useState, useEffect } from 'react'
import { automationModes, AutomationLevel } from '../../lib/agent/automation-modes'
import { emergencyControls } from '../../lib/agent/emergency-controls'

export default function ControlPanel() {
  const [level, setLevel] = useState<AutomationLevel>('manual')
  const [isStopped, setIsStopped] = useState(false)
  const [metrics, setMetrics] = useState(automationModes.getMetrics())
  
  useEffect(() => {
    const config = automationModes.getConfig()
    setLevel(config.level)
    setIsStopped(emergencyControls.isStopped())
    
    const unsubscribe = emergencyControls.onStateChange((state) => {
      setIsStopped(state.stopped)
    })
    
    return unsubscribe
  }, [])
  
  const handleLevelChange = (newLevel: AutomationLevel) => {
    automationModes.setLevel(newLevel)
    setLevel(newLevel)
  }
  
  const handleEmergencyStop = () => {
    emergencyControls.emergencyStop('User initiated emergency stop', 'user')
  }
  
  const handleResume = () => {
    emergencyControls.resume()
  }
  
  const successRate = metrics.totalActions > 0 
    ? (metrics.successfulActions / metrics.totalActions * 100).toFixed(1)
    : '0'
  
  return (
    <div className="card space-y-6">
      <h3 className="text-lg font-semibold">AI Agent Control Panel</h3>
      
      {/* Emergency Controls */}
      <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
        <h4 className="font-medium text-red-900 mb-3">Emergency Controls</h4>
        {isStopped ? (
          <div className="space-y-2">
            <div className="text-red-800 text-sm">⚠️ Agent operations stopped</div>
            <button
              onClick={handleResume}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Resume Operations
            </button>
          </div>
        ) : (
          <button
            onClick={handleEmergencyStop}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Emergency Stop
          </button>
        )}
      </div>
      
      {/* Automation Level */}
      <div>
        <h4 className="font-medium mb-3">Automation Level</h4>
        <div className="grid grid-cols-3 gap-2">
          {(['manual', 'semi-auto', 'full-auto'] as AutomationLevel[]).map((l) => (
            <button
              key={l}
              onClick={() => handleLevelChange(l)}
              disabled={isStopped}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                level === l
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {l === 'manual' && 'Manual'}
              {l === 'semi-auto' && 'Semi-Auto'}
              {l === 'full-auto' && 'Full Auto'}
            </button>
          ))}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {level === 'manual' && 'All actions require manual approval'}
          {level === 'semi-auto' && 'Small actions auto-approved, large require approval'}
          {level === 'full-auto' && 'All actions auto-approved within limits'}
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div>
        <h4 className="font-medium mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Actions</div>
            <div className="text-2xl font-bold">{metrics.totalActions}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-2xl font-bold">{successRate}%</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Value</div>
            <div className="text-2xl font-bold">${metrics.totalValue.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Avg Time</div>
            <div className="text-2xl font-bold">{metrics.avgExecutionTime.toFixed(1)}s</div>
          </div>
        </div>
      </div>
      
      {/* Agent Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium">Agent Status</span>
        <span className={`px-3 py-1 rounded-full text-sm ${
          isStopped 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {isStopped ? 'Stopped' : 'Active'}
        </span>
      </div>
    </div>
  )
}
