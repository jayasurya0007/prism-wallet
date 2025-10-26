export interface EmergencyState {
  stopped: boolean;
  reason: string;
  timestamp: Date | null;
  triggeredBy: 'user' | 'system' | null;
}

export class EmergencyControls {
  private state: EmergencyState;
  private listeners: Array<(state: EmergencyState) => void> = [];
  
  constructor() {
    this.state = {
      stopped: false,
      reason: '',
      timestamp: null,
      triggeredBy: null
    };
    this.loadState();
  }
  
  emergencyStop(reason: string, triggeredBy: 'user' | 'system' = 'user'): void {
    if (typeof reason !== 'string' || reason.length === 0) {
      reason = 'Emergency stop triggered';
    }
    
    const sanitizedReason = reason.replace(/[\r\n]/g, ' ').substring(0, 200);
    
    this.state = {
      stopped: true,
      reason: sanitizedReason,
      timestamp: new Date(),
      triggeredBy
    };
    
    this.saveState();
    this.notifyListeners();
    
    console.error(`[EMERGENCY STOP] ${sanitizedReason} (triggered by: ${triggeredBy})`);
  }
  
  resume(): void {
    if (!this.state.stopped) return;
    
    this.state = {
      stopped: false,
      reason: '',
      timestamp: null,
      triggeredBy: null
    };
    
    this.saveState();
    this.notifyListeners();
    
    console.log('[EMERGENCY] Operations resumed');
  }
  
  isStopped(): boolean {
    return this.state.stopped;
  }
  
  getState(): EmergencyState {
    return { ...this.state };
  }
  
  checkAndStop(condition: boolean, reason: string): void {
    if (typeof condition !== 'boolean') {
      console.error('Invalid condition type');
      return;
    }
    
    try {
      if (condition && !this.state.stopped) {
        this.emergencyStop(reason, 'system');
      }
    } catch (error) {
      console.error('Check and stop failed:', error);
    }
  }
  
  onStateChange(callback: (state: EmergencyState) => void): () => void {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    try {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    } catch (error) {
      console.error('Failed to register state change listener:', error);
      return () => {};
    }
  }
  
  private notifyListeners(): void {
    try {
      this.listeners.forEach(callback => {
        try {
          callback(this.state);
        } catch (error) {
          console.error('Listener callback failed:', error);
        }
      });
    } catch (error) {
      console.error('Failed to notify listeners:', error);
    }
  }
  
  private saveState(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('emergency_state', JSON.stringify(this.state));
      } catch (error) {
        console.error('Failed to save emergency state:', error);
      }
    }
  }
  
  private loadState(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('emergency_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            this.state = parsed;
          }
        }
      } catch (error) {
        console.error('Failed to load emergency state:', error);
      }
    }
  }
}

export const emergencyControls = new EmergencyControls();
