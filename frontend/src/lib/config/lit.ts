export const LIT_NETWORKS = {
  DATIL_DEV: 'datil-dev',
  DATIL_TEST: 'datil-test',
  HABANERO: 'habanero',
  MANZANO: 'manzano'
} as const;

export type LitNetwork = typeof LIT_NETWORKS[keyof typeof LIT_NETWORKS];

export interface LitConfig {
  network: LitNetwork;
  pkpPublicKey?: string;
  authMethod?: string;
  sessionDuration: number; // in milliseconds
}

export const getLitConfig = (): LitConfig => ({
  network: (process.env.LIT_NETWORK as LitNetwork) || LIT_NETWORKS.DATIL_DEV,
  pkpPublicKey: process.env.LIT_PKP_PUBLIC_KEY,
  authMethod: process.env.LIT_AUTH_METHOD,
  sessionDuration: 3600000 // 1 hour
});

export const LIT_CHAIN_MAPPINGS: Record<number, string> = {
  1: 'ethereum',
  10: 'optimism',
  137: 'polygon',
  42161: 'arbitrum',
  43114: 'avalanche',
  8453: 'base',
  11155111: 'sepolia',
  11155420: 'optimismSepolia',
  80002: 'polygonAmoy',
  421614: 'arbitrumSepolia',
  84532: 'baseSepolia'
};