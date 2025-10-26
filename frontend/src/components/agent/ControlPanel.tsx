'use client';

import { useState } from 'react';
import { ConfigPanel } from './ConfigPanel';
import { PolicyManager } from './PolicyManager';
import { StatusMonitor } from './StatusMonitor';

export function ControlPanel() {
  const [activeTab, setActiveTab] = useState<'config' | 'policy' | 'status'>('status');

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex -mb-px min-w-max">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'status'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'config'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'policy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Policies
            </button>
          </nav>
        </div>
      </div>

      <div>
        {activeTab === 'status' && <StatusMonitor />}
        {activeTab === 'config' && <ConfigPanel />}
        {activeTab === 'policy' && <PolicyManager />}
      </div>
    </div>
  );
}
