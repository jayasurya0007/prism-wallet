import { useState, useCallback } from 'react';
import { autonomousSigner } from '../lib/lit/autonomous-signer';
import { policyEngine, TransactionData } from '../lib/lit/policy-engine';
import { PKPSigningResponse } from '../types/lit';

interface UseAutonomousSigningReturn {
  signWithPolicy: (pkpPublicKey: string, toSign: string, txData: TransactionData) => Promise<PKPSigningResponse>;
  validateTransaction: (pkpPublicKey: string, txData: TransactionData) => { isValid: boolean; errors: string[] };
  loading: boolean;
  error: string | null;
}

export function useAutonomousSigning(): UseAutonomousSigningReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signWithPolicy = useCallback(async (
    pkpPublicKey: string, 
    toSign: string, 
    txData: TransactionData
  ): Promise<PKPSigningResponse> => {
    setLoading(true);
    setError(null);

    try {
      // Setup default Lit Action if not already configured
      autonomousSigner.setupDefaultLitAction();
      
      const response = await autonomousSigner.signWithPolicy(
        pkpPublicKey,
        toSign,
        txData
      );
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signing failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateTransaction = useCallback((
    pkpPublicKey: string, 
    txData: TransactionData
  ) => {
    const validation = policyEngine.validateTransaction(pkpPublicKey, txData);
    return {
      isValid: validation.isValid,
      errors: validation.errors
    };
  }, []);

  return {
    signWithPolicy,
    validateTransaction,
    loading,
    error
  };
}