'use client'

import { createContext, useContext, ReactNode } from 'react'
import '../../styles/nexus-widgets.css'

interface NexusWidgetContextType {
  theme: 'light' | 'dark'
  compact: boolean
}

const NexusWidgetContext = createContext<NexusWidgetContextType>({
  theme: 'light',
  compact: false
})

interface NexusWidgetProviderProps {
  children: ReactNode
  theme?: 'light' | 'dark'
  compact?: boolean
}

export function NexusWidgetProvider({ 
  children, 
  theme = 'light', 
  compact = false 
}: NexusWidgetProviderProps) {
  return (
    <NexusWidgetContext.Provider value={{ theme, compact }}>
      <div className={`nexus-widgets-container ${theme === 'dark' ? 'dark' : ''}`}>
        {children}
      </div>
    </NexusWidgetContext.Provider>
  )
}

export function useNexusWidget() {
  return useContext(NexusWidgetContext)
}