'use client'

import { useState, useEffect } from 'react'
import { permissionManager, ResourcePermission } from '../../lib/lit/permissions'
import { keyRotationManager, KeyRotationConfig } from '../../lib/lit/key-rotation'
import { useLitPKP } from '../../hooks/useLitPKP'
import { LitAbility } from '@lit-protocol/auth-helpers'

export default function PermissionManager() {
  const { activeWallet } = useLitPKP()
  const [permissions, setPermissions] = useState<ResourcePermission[]>([])
  const [rotationConfig, setRotationConfig] = useState<KeyRotationConfig | null>(null)
  const [showAddPermission, setShowAddPermission] = useState(false)
  const [newPermission, setNewPermission] = useState({
    resource: '',
    ability: LitAbility.PKPSigning,
    expiration: ''
  })

  useEffect(() => {
    if (activeWallet) {
      const perms = permissionManager.getActivePermissions(activeWallet.publicKey)
      setPermissions(perms)
      
      const config = keyRotationManager.getRotationConfig(activeWallet.publicKey)
      setRotationConfig(config || keyRotationManager.createDefaultRotationConfig())
    }
  }, [activeWallet])

  const handleAddPermission = () => {
    if (!activeWallet || !newPermission.resource) return

    const permission: ResourcePermission = {
      resource: newPermission.resource,
      ability: newPermission.ability,
      granted: true,
      grantedAt: new Date(),
      expiresAt: newPermission.expiration ? new Date(newPermission.expiration) : undefined
    }

    permissionManager.grantPermissions(activeWallet.publicKey, [permission])
    setPermissions(permissionManager.getActivePermissions(activeWallet.publicKey))
    setShowAddPermission(false)
    setNewPermission({ resource: '', ability: LitAbility.PKPSigning, expiration: '' })
  }

  const handleRevokePermission = (resource: string, ability: LitAbility) => {
    if (!activeWallet) return

    permissionManager.revokePermission(activeWallet.publicKey, resource, ability)
    setPermissions(permissionManager.getActivePermissions(activeWallet.publicKey))
  }

  const handleRotationConfigUpdate = (updates: Partial<KeyRotationConfig>) => {
    if (!activeWallet || !rotationConfig) return

    const newConfig = { ...rotationConfig, ...updates }
    keyRotationManager.setRotationConfig(activeWallet.publicKey, newConfig)
    setRotationConfig(newConfig)
  }

  const handleManualRotation = async () => {
    if (!activeWallet) return

    // Would need to get auth methods from storage
    const authMethods: any[] = []
    await keyRotationManager.rotateSessionKeys(activeWallet.publicKey, authMethods, 'manual')
  }

  if (!activeWallet) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">No Active PKP Wallet</div>
          <div className="text-sm">Connect a PKP wallet to manage permissions</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Permissions Management */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Resource Permissions</h3>
          <button
            onClick={() => setShowAddPermission(!showAddPermission)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Permission
          </button>
        </div>

        {showAddPermission && (
          <div className="mb-4 p-4 border border-gray-200 rounded-lg">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource
                </label>
                <input
                  type="text"
                  value={newPermission.resource}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, resource: e.target.value }))}
                  placeholder="lit-action:*, chain:1, pkp:..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ability
                </label>
                <select
                  value={newPermission.ability}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, ability: e.target.value as LitAbility }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={LitAbility.PKPSigning}>PKP Signing</option>
                  <option value={LitAbility.LitActionExecution}>Lit Action Execution</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newPermission.expiration}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, expiration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleAddPermission}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Grant Permission
                </button>
                <button
                  onClick={() => setShowAddPermission(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {permissions.map((permission, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-sm">{permission.resource}</div>
                <div className="text-xs text-gray-500">
                  {permission.ability} • Granted {permission.grantedAt.toLocaleDateString()}
                  {permission.expiresAt && ` • Expires ${permission.expiresAt.toLocaleDateString()}`}
                </div>
              </div>
              <button
                onClick={() => handleRevokePermission(permission.resource, permission.ability)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Revoke
              </button>
            </div>
          ))}
          
          {permissions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">No active permissions</div>
              <div className="text-sm">Add permissions to control resource access</div>
            </div>
          )}
        </div>
      </div>

      {/* Key Rotation Settings */}
      {rotationConfig && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Rotation Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Auto Rotation
              </label>
              <input
                type="checkbox"
                checked={rotationConfig.autoRotate}
                onChange={(e) => handleRotationConfigUpdate({ autoRotate: e.target.checked })}
                className="rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rotation Interval (hours)
              </label>
              <input
                type="number"
                value={rotationConfig.rotationInterval / (60 * 60 * 1000)}
                onChange={(e) => handleRotationConfigUpdate({ 
                  rotationInterval: Number(e.target.value) * 60 * 60 * 1000 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Session Age (minutes)
              </label>
              <input
                type="number"
                value={rotationConfig.maxSessionAge / (60 * 1000)}
                onChange={(e) => handleRotationConfigUpdate({ 
                  maxSessionAge: Number(e.target.value) * 60 * 1000 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <button
              onClick={handleManualRotation}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Rotate Keys Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}