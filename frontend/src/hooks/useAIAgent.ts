import { useState, useCallback } from 'react';
import { AgentDecision, AgentConfig, PortfolioData } from '../types/agent';

interface YieldOpportunity {
  protocol: string;
  apy: number;
  chainId: number;
  token: string;
  tvl: number;
  category: string;
  riskScore: number;
}

interface AgentStatus {
  active: boolean;
  lastAction: string;
  totalActions: number;
  successRate: number;
  config: AgentConfig;
}

interface UseAIAgentReturn {
  status: AgentStatus | null;
  decision: AgentDecision | null;
  opportunities: YieldOpportunity[];
  loading: boolean;
  error: string | null;
  startAgent: (config?: Partial<AgentConfig>) => Promise<void>;
  stopAgent: () => Promise<void>;
  analyzePortfolio: (portfolioData: any) => Promise<void>;
  updateConfig: (config: Partial<AgentConfig>) => Promise<void>;
  refreshData: () => Promise<void>;
  getHistory: () => Promise<AgentDecision[]>;
}

const getApiBase = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Validate API URL format and security
  if (!apiUrl || typeof apiUrl !== 'string') {
    throw new Error('API URL is required');
  }
  
  // Ensure HTTPS for production and validate URL format
  if (!/^https:\/\/[a-zA-Z0-9.-]+(?:\:[0-9]+)?(?:\/[^\s]*)?$/.test(apiUrl)) {
    throw new Error('Invalid or insecure API URL format');
  }
  
  return apiUrl;
};

export function useAIAgent(): UseAIAgentReturn {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [decision, setDecision] = useState<AgentDecision | null>(null);
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any) => {
    // Sanitize error message to prevent log injection
    let message = 'An error occurred';
    
    if (err?.response?.data?.error && typeof err.response.data.error === 'string') {
      message = err.response.data.error
        .replace(/[\r\n\t]/g, ' ') // Remove line breaks
        .replace(/[<>"'&\\]/g, '') // Remove potentially dangerous characters
        .substring(0, 200); // Limit message length
    } else if (err?.message && typeof err.message === 'string') {
      message = err.message
        .replace(/[\r\n\t]/g, ' ')
        .replace(/[<>"'&\\]/g, '')
        .substring(0, 200);
    }
    
    setError(message);
    // Log error without exposing sensitive information
    console.error('AI Agent error occurred');
  };

  const startAgent = useCallback(async (config?: Partial<AgentConfig>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getApiBase()}/agent/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      setStatus(data.status);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const stopAgent = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getApiBase()}/agent/stop`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      setStatus(data.status);
      setDecision(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzePortfolio = useCallback(async (portfolioData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getApiBase()}/agent/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolioData)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      setDecision(data.decision);
      setOpportunities(data.opportunities || []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (config: Partial<AgentConfig>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getApiBase()}/agent/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      setStatus(data.status);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getApiBase()}/agent/refresh`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (): Promise<AgentDecision[]> => {
    try {
      const response = await fetch(`${getApiBase()}/agent/history`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.history || [];
    } catch (err) {
      handleError(err);
      return [];
    }
  }, []);

  return {
    status,
    decision,
    opportunities,
    loading,
    error,
    startAgent,
    stopAgent,
    analyzePortfolio,
    updateConfig,
    refreshData,
    getHistory
  };
}