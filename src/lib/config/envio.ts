export interface EnvioConfig {
  graphqlEndpoint: string;
  hyperSyncEndpoints: Record<number, string>;
}

export const getEnvioConfig = (): EnvioConfig => ({
  graphqlEndpoint: process.env.ENVIO_GRAPHQL_ENDPOINT || '',
  hyperSyncEndpoints: parseHyperSyncEndpoints()
});

function parseHyperSyncEndpoints(): Record<number, string> {
  const endpoints = process.env.HYPERSYNC_ENDPOINTS;
  if (!endpoints) return {};
  
  try {
    return JSON.parse(endpoints);
  } catch {
    return {};
  }
}

export const DEFAULT_HYPERSYNC_ENDPOINTS: Record<number, string> = {
  1: 'https://eth.hypersync.xyz',
  10: 'https://optimism.hypersync.xyz',
  137: 'https://polygon.hypersync.xyz',
  42161: 'https://arbitrum.hypersync.xyz',
  43114: 'https://avalanche.hypersync.xyz',
  8453: 'https://base.hypersync.xyz'
};

export const TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  1: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
  137: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
  },
  42161: {
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
  },
  10: {
    USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'
  },
  43114: {
    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7'
  },
  8453: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  }
};