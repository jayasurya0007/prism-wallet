'use client'

import { useState } from 'react'
import PortfolioOverview from './PortfolioOverview'
import AgentControlPanel from './agent/ControlPanel'
import BridgeDashboard from './BridgeDashboard'
import { BalanceWidget, BridgeWidget, NexusWidgetProvider } from './nexus'
import PKPAuth from './auth/PKPAuth'


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'bridge' | 'agent' | 'auth'>('portfolio')

  return (
    <NexusWidgetProvider>
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
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('bridge')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'bridge'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bridge
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'agent'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            AI Agent
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'auth'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            PKP Auth
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BalanceWidget address="0x742d35Cc6634C0532925a3b8D400e5e5c8C8b8b8" showAggregated />
            <PortfolioOverview />
          </div>
        )}
        {activeTab === 'bridge' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BridgeWidget />
            <BridgeDashboard />
          </div>
        )}
        {activeTab === 'agent' && <AgentControlPanel />}
        {activeTab === 'auth' && <PKPAuth />}
      </div>
    </NexusWidgetProvider>
  )
}