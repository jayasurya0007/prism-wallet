export interface NetworkConfig {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  isTestnet: boolean;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  // Mainnet Chains
  1: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    isTestnet: false,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  10: {
    id: 10,
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
    isTestnet: false,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  137: {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    isTestnet: false,
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  },
  42161: {
    id: 42161,
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    isTestnet: false,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  43114: {
    id: 43114,
    name: 'Avalanche',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorer: 'https://snowtrace.io',
    isTestnet: false,
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 }
  },
  8453: {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    isTestnet: false,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  534351: {
    id: 534351,
    name: 'Scroll',
    rpcUrl: 'https://rpc.scroll.io',
    blockExplorer: 'https://scrollscan.com',
    isTestnet: false,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  50104: {
    id: 50104,
    name: 'Sophon',
    rpcUrl: 'https://rpc.sophon.xyz',
    blockExplorer: 'https://explorer.sophon.xyz',
    isTestnet: false,
    nativeCurrency: { name: 'Sophon', symbol: 'SOPH', decimals: 18 }
  },
  8217: {
    id: 8217,
    name: 'Kaia',
    rpcUrl: 'https://public-en-cypress.klaytn.net',
    blockExplorer: 'https://scope.klaytn.com',
    isTestnet: false,
    nativeCurrency: { name: 'KLAY', symbol: 'KLAY', decimals: 18 }
  },
  56: {
    id: 56,
    name: 'BNB Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorer: 'https://bscscan.com',
    isTestnet: false,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
  },
  9000000: {
    id: 9000000,
    name: 'HyperEVM',
    rpcUrl: 'https://rpc.hyperevm.org',
    blockExplorer: 'https://explorer.hyperevm.org',
    isTestnet: false,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  
  // Testnet Chains
  11155111: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
    isTestnet: true,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }
  },
  11155420: {
    id: 11155420,
    name: 'Optimism Sepolia',
    rpcUrl: 'https://sepolia.optimism.io',
    blockExplorer: 'https://sepolia-optimism.etherscan.io',
    isTestnet: true,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }
  },
  80002: {
    id: 80002,
    name: 'Polygon Amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com',
    isTestnet: true,
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  },
  421614: {
    id: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorer: 'https://sepolia.arbiscan.io',
    isTestnet: true,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }
  },
  84532: {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia-explorer.base.org',
    isTestnet: true,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }
  },
  1014: {
    id: 1014,
    name: 'Monad Testnet',
    rpcUrl: 'https://testnet-rpc.monad.xyz',
    blockExplorer: 'https://testnet-explorer.monad.xyz',
    isTestnet: true,
    nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 }
  }
};

export const getSupportedChainIds = (): number[] => {
  return Object.keys(SUPPORTED_NETWORKS).map(Number);
};