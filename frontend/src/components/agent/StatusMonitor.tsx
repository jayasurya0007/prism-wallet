'use client';

import { useState, useEffect } from 'react';
import { automationModes } from '../../lib/agent/automation-modes';
import { emergencyControls } from '../../lib/agent/emergency-controls';
import { actionPipeline } from '../../lib/agent/action-pipeline';

interface AgentStatus {
  isActive: boolean;
  isStopped: boolean;
  lastAction: Date | null;
  totalActions: number;
  successRate: number;
  currentMode: string;
}

export function StatusMonitor() {
  const [status, setStatus] = useState<AgentStatus>({
    isActive: false,
    isStopped: false,
    lastAction: null,
    totalActions: 0,
    successRate: 0,
    currentMode: 'manual'
  });

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    
    const unsubscribe = emergencyControls.onStateChange((state) => {
      setStatus(prev => ({ ...prev, isStopped: state.stopped }));
      if (state.stopped) {
        addLog(`🛑 Emergency stop: ${state.reason}`);
      } else {
        addLog('✅ Operations resumed');
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const updateStatus = () => {
    try {
      const metrics = automationModes.getMetrics();
      const config = automationModes.getConfig();
      const emergencyState = emergencyControls.getState();

      const successRate = metrics.totalActions > 0
        ? (metrics.successfulActions / metrics.totalActions) * 100
        : 0;

      setStatus({
        isActive: !emergencyState.stopped && config.level !== 'manual',
        isStopped: emergencyState.stopped,
        lastAction: metrics.lastActionTime,
        totalActions: metrics.totalActions,
        successRate,
        currentMode: config.level
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const getStatusColor = () => {
    if (status.isStopped) return 'bg-red-500';
    if (status.isActive) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (status.isStopped) return 'Stopped';
    if (status.isActive) return 'Active';
    return 'Idle';
  };

  const formatLastAction = () => {
    if (!status.lastAction) return 'Never';
    
    const now = Date.now();
    const diff = now - new Date(status.lastAction).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(status.lastAction).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Agent Status</h2>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getStatusColor()} animate-pulse flex-shrink-0`}></div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Status</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900">{getStatusText()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-600">Mode</p>
            <p className="text-sm sm:text-base font-semibold text-gray-900 capitalize">{status.currentMode}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-600 mb-1">Total Actions</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-900">{status.totalActions}</p>
          </div>
          
          <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
            <p className="text-xs sm:text-sm text-green-600 mb-1">Success Rate</p>
            <p className="text-xl sm:text-2xl font-bold text-green-900">
              {status.successRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Last Action</p>
          <p className="text-sm sm:text-base font-medium text-gray-900">{formatLastAction()}</p>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Activity Log</h3>
          <div className="bg-gray-900 rounded-lg p-2 sm:p-3 h-40 sm:h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-xs sm:text-sm">No activity yet</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <p key={i} className="text-xs text-green-400 font-mono break-all">
                    {log}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚡</span>
            <span className="text-sm text-yellow-800">
              Pipeline: Envio → AI → Lit → Avail
            </span>
          </div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
