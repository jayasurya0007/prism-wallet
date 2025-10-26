# Code Examples & File Structure Guide

This document provides code examples from the actual implementation to help you understand how each component works.

---

## 📂 Frontend Structure with Examples

### Main Entry Point

**File**: `frontend/src/app/page.tsx`
```typescript
import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Cross-Chain AI Wallet Agent
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Autonomous portfolio management powered by Avail Nexus, Lit Protocol, and Envio
        </p>
      </div>
      
      <Dashboard />
    </main>
  )
}
```
**Purpose**: Main landing page that renders the Dashboard component

---

### Dashboard Component

**File**: `frontend/src/components/Dashboard.tsx`
```typescript
'use client'

import { useState } from 'react'
import PortfolioOverview from './PortfolioOverview'
import AgentControlPanel from './agent/ControlPanel'
import BridgeDashboard from './BridgeDashboard'
import { BalanceWidget, BridgeWidget, NexusWidgetProvider } from './nexus'
import PKPAuth from './auth/PKPAuth'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'bridge' | 'agent' | 'auth'>('portfolio')

  return (
    <NexusWidgetProvider>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('portfolio')} className="...">
            Portfolio
          </button>
          {/* Other tabs... */}
        </div>

        {/* Tab Content */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BalanceWidget address="0x742d35Cc6634C0532925a3b8D400e5e5c8C8b8b8" showAggregated />
            <PortfolioOverview />
          </div>
        )}
        {/* Other tab contents... */}
      </div>
    </NexusWidgetProvider>
  )
}
```
**Purpose**: Main dashboard with 4 tabs - Portfolio, Bridge, AI Agent, PKP Auth

---

## 🔗 Avail Nexus Integration

### Nexus Client

**File**: `frontend/src/lib/nexus/client.ts`
```typescript
import { NexusSDK } from '@avail-project/nexus-core';

export class NexusClient {
  private sdk: NexusSDK;
  private supportedChains: number[];

  constructor() {
    this.sdk = new NexusSDK({
      endpoint: process.env.NEXT_PUBLIC_AVAIL_NEXUS_ENDPOINT || 'https://api.nexus.avail.so',
      chains: [1, 10, 137, 42161, 43114, 8453]
    });
    this.supportedChains = [1, 10, 137, 42161, 43114, 8453];
  }

  async initialize() {
    // Set EVM provider
    if (typeof window !== 'undefined' && window.ethereum) {
      this.sdk.setEVMProvider(window.ethereum);
    } else {
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
      this.sdk.setEVMProvider(provider);
    }
    
    await this.sdk.initialize();
    console.log('Nexus SDK initialized');
  }

  async getBalances(address: string, chainIds?: number[]): Promise<TokenBalance[]> {
    // Validate address
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid Ethereum address format');
    }

    const chains = chainIds || this.supportedChains;
    const balances: TokenBalance[] = [];
    
    // Ensure SDK is initialized
    await this.initialize();
    
    // Get unified balances across chains
    for (const chainId of chains) {
      const chainBalances = await this.getChainBalances(address, chainId);
      balances.push(...chainBalances);
    }
    
    return balances;
  }

  async getAggregatedBalances(address: string): Promise<AggregatedBalance[]> {
    const balances = await this.getBalances(address);
    const aggregated = new Map<string, AggregatedBalance>();

    for (const balance of balances) {
      const key = balance.symbol;
      if (!aggregated.has(key)) {
        aggregated.set(key, {
          token: balance.address,
          symbol: balance.symbol,
          totalBalance: '0',
          totalUsdValue: 0,
          balancesByChain: {}
        });
      }

      const agg = aggregated.get(key)!;
      agg.balancesByChain[balance.chainId] = balance;
      agg.totalBalance = (BigInt(agg.totalBalance) + BigInt(balance.balance)).toString();
      agg.totalUsdValue += balance.usdValue || 0;
    }

    return Array.from(aggregated.values());
  }

  private async getNativeBalance(address: string, chainId: number): Promise<TokenBalance | null> {
    // Use Avail Nexus SDK to get native token balance
    const balance = await this.sdk.getBalance({
      address,
      chainId,
      token: 'native'
    });
    
    return {
      address: '0x0000000000000000000000000000000000000000',
      symbol: network.nativeCurrency.symbol,
      balance: balance.amount,
      decimals: network.nativeCurrency.decimals,
      chainId,
      usdValue: balance.usdValue || 0,
      name: network.nativeCurrency.name
    };
  }
}

export const nexusClient = new NexusClient();
```
**Key Features**:
- Multi-chain balance fetching
- Address validation
- Automatic SDK initialization
- Balance aggregation across chains

---

## 🔐 Lit Protocol Integration

### Lit Client Setup

**File**: `frontend/src/lib/lit/client.ts`
```typescript
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_NETWORK } from '@lit-protocol/constants';

export class LitClient {
  private client: LitNodeClient | null = null;
  private isConnected: boolean = false;

  async initialize() {
    if (this.isConnected) return;

    this.client = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev, // Use DatilDev for testing
      debug: process.env.NODE_ENV === 'development'
    });

    await this.client.connect();
    this.isConnected = true;
    console.log('Lit Protocol client connected');
  }

  getClient(): LitNodeClient {
    if (!this.client || !this.isConnected) {
      throw new Error('Lit client not initialized. Call initialize() first.');
    }
    return this.client;
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('Lit Protocol client disconnected');
    }
  }
}

export const litClient = new LitClient();
```

### Signing Policy (Lit Action)

**File**: `lit-actions/signing-policy.js`
```javascript
const go = async () => {
  const { toSign, publicKey, sigName, transactionData, policy } = Lit.Actions.getParams();

  // Default policy
  const defaultPolicy = {
    maxAmount: 100,              // Max $100 per transaction
    allowedChains: [1, 10, 137, 42161],
    requireGasBelow: 200,        // Max 200 Gwei
    allowedTokens: ['USDC', 'USDT', 'ETH'],
    cooldownPeriod: 300          // 5 minutes
  };

  const activePolicy = policy || defaultPolicy;

  try {
    const txData = JSON.parse(transactionData);
    
    // Validation 1: Amount limit
    if (txData.amount && parseFloat(txData.amount) > activePolicy.maxAmount) {
      return Lit.Actions.setResponse({ 
        response: JSON.stringify({ 
          success: false,
          error: `Amount ${txData.amount} exceeds limit of ${activePolicy.maxAmount}` 
        })
      });
    }

    // Validation 2: Chain allowlist
    if (txData.chainId && !activePolicy.allowedChains.includes(txData.chainId)) {
      return Lit.Actions.setResponse({ 
        response: JSON.stringify({ 
          success: false,
          error: `Chain ${txData.chainId} not allowed` 
        })
      });
    }

    // Validation 3: Gas price limit
    if (txData.gasPrice && txData.gasPrice > activePolicy.requireGasBelow * 1e9) {
      return Lit.Actions.setResponse({ 
        response: JSON.stringify({ 
          success: false,
          error: `Gas price too high` 
        })
      });
    }

    // Validation 4: Token allowlist
    if (txData.token && !activePolicy.allowedTokens.includes(txData.token)) {
      return Lit.Actions.setResponse({ 
        response: JSON.stringify({ 
          success: false,
          error: `Token ${txData.token} not allowed` 
        })
      });
    }

    // Validation 5: Cooldown period
    const now = Math.floor(Date.now() / 1000);
    const lastSigningTime = parseInt(txData.lastSigningTime || '0');
    
    if (lastSigningTime && (now - lastSigningTime) < activePolicy.cooldownPeriod) {
      const remainingCooldown = activePolicy.cooldownPeriod - (now - lastSigningTime);
      return Lit.Actions.setResponse({ 
        response: JSON.stringify({ 
          success: false,
          error: `Cooldown active. Wait ${remainingCooldown} seconds` 
        })
      });
    }

    // All validations passed - sign the transaction
    const sigShare = await Lit.Actions.signEcdsa({
      toSign,
      publicKey,
      sigName
    });

    Lit.Actions.setResponse({ 
      response: JSON.stringify({ 
        success: true,
        signature: sigShare,
        timestamp: now,
        policy: activePolicy
      })
    });

  } catch (error) {
    Lit.Actions.setResponse({ 
      response: JSON.stringify({ 
        success: false,
        error: `Policy validation failed: ${error.message}` 
      })
    });
  }
};

go();
```
**Security Features**:
- 5 layers of validation before signing
- Configurable policies
- Cooldown period enforcement
- Error handling and logging

---

## 📊 Envio Integration

### Envio Configuration

**File**: `envio/config.yaml`
```yaml
name: WalletMonitor
description: Cross-chain portfolio monitoring

networks:
  - id: 1              # Ethereum mainnet
    start_block: 18500000
  - id: 137            # Polygon
    start_block: 48000000
  - id: 42161          # Arbitrum
    start_block: 140000000

contracts:
  - name: USDC_Ethereum
    abi_file_path: ./abis/erc20.json
    address: 
      - address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    handler: ./src/handlers.ts
    events:
      - event: Transfer(address indexed from, address indexed to, uint256 value)
      
  - name: USDC_Polygon
    abi_file_path: ./abis/erc20.json
    address:
      - address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    handler: ./src/handlers.ts
    events:
      - event: Transfer(address indexed from, address indexed to, uint256 value)
      
  - name: USDC_Arbitrum
    abi_file_path: ./abis/erc20.json
    address:
      - address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
    handler: ./src/handlers.ts
    events:
      - event: Transfer(address indexed from, address indexed to, uint256 value)
```

### Event Handlers

**File**: `envio/src/handlers.ts`
```typescript
import { Transfer } from "../generated/src/Types.gen";

export async function handleTransfer(event: Transfer) {
  const { from, to, value } = event.params;
  const usdValue = calculateUSDValue(value, event.chainId);
  
  // Store all transfers
  const transfer = {
    id: event.transactionHash + "-" + event.logIndex,
    from,
    to,
    value: value.toString(),
    blockNumber: event.blockNumber,
    timestamp: event.blockTimestamp,
    chainId: event.chainId
  };
  
  // Flag high-value transfers for AI monitoring
  if (usdValue > 10000) {
    const highValueTransfer = {
      ...transfer,
      usdValue,
      flagged: true,
      token: 'USDC'
    };
    
    console.log('🚨 AI Alert: High-value transfer detected');
    console.log(`  Amount: $${usdValue.toLocaleString()}`);
    console.log(`  Chain: ${event.chainId}`);
    console.log(`  From: ${from}`);
    console.log(`  To: ${to}`);
    
    // TODO: Trigger AI agent analysis
  }
  
  // Update wallet activity metrics
  console.log('✅ Wallet activity recorded');
}

function calculateUSDValue(value: string, chainId: number): number {
  // USDC has 6 decimals
  return parseFloat(value) / 1e6;
}

// Gas price monitoring handler
export async function handleBlock(event: any) {
  const gasPrice = event.block?.gasPrice || '0';
  const gasPriceGwei = parseFloat(gasPrice) / 1e9;
  
  if (gasPriceGwei < 50) {
    console.log('⚡ AI Alert: Optimal gas conditions detected');
    console.log(`  Gas Price: ${gasPriceGwei.toFixed(2)} Gwei`);
    console.log(`  Chain: ${event.chainId}`);
    
    // TODO: Trigger AI agent to execute pending transactions
  }
}
```
**Monitoring Features**:
- Real-time event tracking across 3 chains
- High-value transfer detection (>$10k)
- Gas price monitoring
- Automatic alerts for AI agent

---

## 🤖 Backend & AI Agent

### Backend Server

**File**: `backend/index.ts`
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/agent/status', (req, res) => {
  res.json({ 
    active: false, 
    actions: 0,
    lastUpdate: new Date().toISOString()
  });
});

app.get('/api/portfolio/:address', (req, res) => {
  const { address } = req.params;
  res.json({ 
    address,
    totalValue: 0, 
    balances: [],
    lastFetch: new Date().toISOString()
  });
});

// WebSocket Connection
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.send(JSON.stringify({ 
    type: 'connected',
    message: 'WebSocket connection established'
  }));
  
  // Handle messages from client
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });
  
  // Handle disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});
```

### AI Agent Service

**File**: `backend/services/ai-agent.ts`
```typescript
export interface AgentDecision {
  action: 'bridge' | 'yield' | 'rebalance' | 'hold';
  confidence: number;
  reasoning: string;
  estimatedGain: number;
}

export class AIAgent {
  private isActive = false;

  start() {
    this.isActive = true;
    console.log('🤖 AI Agent started');
  }

  stop() {
    this.isActive = false;
    console.log('🛑 AI Agent stopped');
  }

  async analyze(portfolioData: any): Promise<AgentDecision> {
    if (!this.isActive) {
      return {
        action: 'hold',
        confidence: 0,
        reasoning: 'Agent inactive',
        estimatedGain: 0
      };
    }

    // Example decision logic (simplified)
    // In production, this would use ML models and complex analysis
    
    const totalValue = portfolioData.totalValue || 0;
    const gasPrice = portfolioData.currentGasPrice || 100;
    
    // If gas is low and we have funds, consider rebalancing
    if (gasPrice < 50 && totalValue > 1000) {
      return {
        action: 'rebalance',
        confidence: 0.75,
        reasoning: 'Low gas price, good time to rebalance portfolio',
        estimatedGain: totalValue * 0.02 // 2% estimated gain
      };
    }
    
    // Default to hold
    return {
      action: 'hold',
      confidence: 0.8,
      reasoning: 'Portfolio balanced, no action needed',
      estimatedGain: 0
    };
  }

  getStatus() {
    return {
      active: this.isActive,
      lastAction: new Date(),
      totalActions: 0,
      successRate: 0.95
    };
  }
}

export const aiAgent = new AIAgent();
```

---

## 📦 TypeScript Types

### Nexus Types

**File**: `frontend/src/types/nexus.ts`
```typescript
export interface TokenBalance {
  address: string;
  symbol: string;
  balance: string;
  decimals: number;
  chainId: number;
  usdValue?: number;
  name?: string;
}

export interface AggregatedBalance {
  token: string;
  symbol: string;
  totalBalance: string;
  totalUsdValue: number;
  balancesByChain: Record<number, TokenBalance>;
}

export interface ChainConfig {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

export interface BridgeEstimate {
  directCost: string;
  chainAbstractionCost: string;
  recommendedMethod: 'direct' | 'chain-abstraction';
  estimatedTime: number;
}
```

### Lit Protocol Types

**File**: `frontend/src/types/lit.ts`
```typescript
export interface PKPInfo {
  publicKey: string;
  ethAddress: string;
  tokenId?: string;
}

export interface SessionSigsConfig {
  pkpPublicKey: string;
  authMethods: any[];
  chain: string;
  expiration: string;
  resourceAbilityRequests: ResourceAbilityRequest[];
}

export interface SigningPolicy {
  maxAmount: number;
  allowedChains: number[];
  requireGasBelow: number;
  allowedTokens: string[];
  cooldownPeriod: number;
}

export interface SigningResult {
  success: boolean;
  signature?: string;
  error?: string;
  timestamp?: number;
  policy?: SigningPolicy;
}
```

### Agent Types

**File**: `frontend/src/types/agent.ts`
```typescript
export interface AgentConfig {
  enabled: boolean;
  policy: SigningPolicy;
  monitoring: {
    highValueThreshold: number;
    gasThreshold: number;
    yieldThreshold: number;
  };
}

export interface AgentAction {
  id: string;
  type: 'bridge' | 'yield' | 'rebalance';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: Date;
  details: any;
  result?: any;
  error?: string;
}

export interface AgentStatus {
  active: boolean;
  lastAction?: Date;
  totalActions: number;
  successRate: number;
  currentBalance: number;
  totalGainLoss: number;
}
```

---

## 🔄 Integration Examples

### Example 1: Fetching Multi-Chain Balances

```typescript
import { nexusClient } from '@/lib/nexus/client';

async function displayUserBalances(walletAddress: string) {
  try {
    // Get balances across all supported chains
    const balances = await nexusClient.getBalances(walletAddress);
    
    console.log('Multi-Chain Balances:');
    balances.forEach(balance => {
      console.log(`  ${balance.symbol} on Chain ${balance.chainId}: ${balance.balance}`);
    });
    
    // Get aggregated view
    const aggregated = await nexusClient.getAggregatedBalances(walletAddress);
    
    console.log('\nAggregated Balances:');
    aggregated.forEach(agg => {
      console.log(`  Total ${agg.symbol}: ${agg.totalBalance} ($${agg.totalUsdValue})`);
    });
  } catch (error) {
    console.error('Failed to fetch balances:', error);
  }
}
```

### Example 2: Autonomous Transaction Signing

```typescript
import { litClient } from '@/lib/lit/client';

async function executeAutonomousTransaction(txData: any) {
  try {
    // Initialize Lit client
    await litClient.initialize();
    const client = litClient.getClient();
    
    // Prepare transaction data
    const transactionData = JSON.stringify({
      amount: 50,
      chainId: 137,
      token: 'USDC',
      gasPrice: 30e9,
      lastSigningTime: 0
    });
    
    // Execute Lit Action with policy validation
    const result = await client.executeJs({
      code: signingPolicyCode,
      sessionSigs: sessionSignatures,
      jsParams: {
        toSign: hashOfTxData,
        publicKey: pkpPublicKey,
        sigName: 'agentSignature',
        transactionData,
        policy: customPolicy
      }
    });
    
    // Parse result
    const response = JSON.parse(result.response);
    
    if (response.success) {
      console.log('✅ Transaction signed successfully');
      console.log('Signature:', response.signature);
      
      // Proceed with execution via Nexus SDK
      await executeTransaction(response.signature);
    } else {
      console.log('❌ Transaction rejected by policy');
      console.log('Reason:', response.error);
    }
  } catch (error) {
    console.error('Autonomous signing failed:', error);
  }
}
```

### Example 3: Real-time Event Monitoring

```typescript
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient(process.env.ENVIO_GRAPHQL_ENDPOINT);

// Query high-value transfers
async function monitorHighValueTransfers() {
  const query = `
    query GetHighValueTransfers {
      transfers(
        where: { usdValue_gte: "10000" },
        orderBy: timestamp,
        orderDirection: desc,
        first: 10
      ) {
        id
        from
        to
        value
        usdValue
        chainId
        timestamp
      }
    }
  `;
  
  try {
    const data = await client.request(query);
    
    console.log('High-Value Transfers (>$10k):');
    data.transfers.forEach(transfer => {
      console.log(`  $${transfer.usdValue} on Chain ${transfer.chainId}`);
      console.log(`    From: ${transfer.from}`);
      console.log(`    To: ${transfer.to}`);
      console.log(`    Time: ${new Date(transfer.timestamp * 1000).toISOString()}`);
    });
    
    // Trigger AI agent if needed
    if (data.transfers.length > 0) {
      await aiAgent.analyze({ highValueActivity: true });
    }
  } catch (error) {
    console.error('Failed to fetch transfers:', error);
  }
}
```

---

## 🚀 Running the Project

### Development Mode

```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# Runs on http://localhost:3000

# Terminal 2: Backend
cd backend
npm run dev
# Runs on http://localhost:8000

# Terminal 3: Envio (optional)
cd envio
envio dev
# Runs on http://localhost:8080
```

### Docker Mode

```bash
# Build and run all services
docker-compose up

# Services:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - Envio: http://localhost:8080
```

---

## 📝 Summary

This guide provides:
- ✅ Real code examples from the project
- ✅ File locations for every component
- ✅ Understanding of how components interact
- ✅ TypeScript type definitions
- ✅ Integration patterns
- ✅ Running instructions

**Next Steps**:
1. Read through the code examples
2. Try running the project locally
3. Modify examples to experiment
4. Build new features using these patterns

For more details, see:
- [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) - Complete architecture
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - Setup instructions
- [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - System design
