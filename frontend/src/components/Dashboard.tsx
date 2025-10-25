'use client'

import { useState } from 'react'
import PortfolioOverview from './PortfolioOverview'
import AgentControlPanel from './agent/ControlPanel'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'agent'>('portfolio')

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'portfolio'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Portfolio Overview
        </button>
        <button
          onClick={() => setActiveTab('agent')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'agent'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          AI Agent Control
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'portfolio' && <PortfolioOverview />}
      {activeTab === 'agent' && <AgentControlPanel />}
    </div>
  )
}