export function validateEnvVars() {
  const required = [
    'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  return missing.length === 0;
}

export function getSupportedChainsFromEnv(): number[] {
  const chains = process.env.SUPPORTED_CHAINS;
  if (!chains) return [1, 10, 137, 42161, 43114, 8453];
  
  return chains.split(',').map(Number).filter(Boolean);
}