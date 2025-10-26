# Cross-Chain AI Wallet Agent - Comprehensive Project Analysis

## 📋 Executive Summary

This is a cutting-edge autonomous AI wallet agent built for ETHOnline 2024, leveraging three powerful sponsor technologies to create an intelligent cross-chain portfolio management system. The project demonstrates advanced blockchain integration, programmable security, and real-time multi-chain data intelligence.

### Key Technologies
1. **Avail Nexus SDK** - Cross-chain unification and bridging
2. **Lit Protocol PKP** - Programmable security and autonomous signing
3. **Envio HyperIndex/HyperSync** - Real-time multi-chain data intelligence

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend Layer                         │
│  Next.js 14 + React 18 + TypeScript + TailwindCSS          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Nexus      │  │     Lit      │  │    Envio     │     │
│  │   Widgets    │  │   Protocol   │  │   GraphQL    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       Backend Layer                          │
│         Express + WebSocket + TypeScript                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  AI Agent    │  │  Execution   │  │   GraphQL    │     │
│  │   Engine     │  │   Engine     │  │   Client     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Avail Nexus   │  │     Lit      │  │    Envio     │     │
│  │    API       │  │   Network    │  │  HyperIndex  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↕                 ↕                  ↕              │
│  ┌──────────────────────────────────────────────────┐     │
│  │        11+ Blockchain Networks (Mainnet/Testnet)  │     │
│  │  ETH, Polygon, Arbitrum, Optimism, Base, etc.    │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User Interaction Flow:
   User → Frontend Dashboard → Nexus Widgets → Avail Nexus SDK → Blockchain

2. Autonomous Agent Flow:
   Envio (Events) → AI Agent → Lit Protocol (Validation) → Avail Nexus (Execution) → Blockchain

3. Real-time Monitoring Flow:
   Blockchain Events → Envio HyperSync → GraphQL → Frontend/Backend → User
```

---

## 📁 Project Structure

```
eth-online-1/
├── frontend/                    # Next.js 14 application
│   ├── src/
│   │   ├── app/                # Next.js app router
│   │   │   ├── page.tsx        # Main dashboard page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── globals.css     # Global styles
│   │   ├── components/         # React components
│   │   │   ├── Dashboard.tsx   # Main dashboard with tabs
│   │   │   ├── PortfolioOverview.tsx
│   │   │   ├── BridgeDashboard.tsx
│   │   │   ├── nexus/          # Avail Nexus widgets
│   │   │   │   ├── BalanceWidget.tsx
│   │   │   │   ├── BridgeWidget.tsx
│   │   │   │   └── NexusWidgetProvider.tsx
│   │   │   ├── lit/            # Lit Protocol components
│   │   │   │   └── PolicyManager.tsx
│   │   │   ├── auth/           # Authentication components
│   │   │   │   ├── PKPAuth.tsx
│   │   │   │   ├── AuthMethodSelector.tsx
│   │   │   │   └── PermissionManager.tsx
│   │   │   └── agent/          # AI agent components
│   │   │       ├── ControlPanel.tsx
│   │   │       └── PortfolioAnalysis.tsx
│   │   ├── lib/                # Core libraries
│   │   │   ├── nexus/          # Avail Nexus integration
│   │   │   │   ├── client.ts   # SDK initialization
│   │   │   │   ├── balances.ts # Balance aggregation
│   │   │   │   └── bridge.ts   # Bridge operations
│   │   │   ├── lit/            # Lit Protocol integration
│   │   │   │   ├── client.ts   # Lit client setup
│   │   │   │   ├── pkp-wallet.ts
│   │   │   │   ├── session-sigs.ts
│   │   │   │   ├── autonomous-signer.ts
│   │   │   │   └── policy-engine.ts
│   │   │   ├── envio/          # Envio integration
│   │   │   ├── config/         # Configuration
│   │   │   └── utils/          # Utilities
│   │   └── types/              # TypeScript definitions
│   │       ├── nexus.ts
│   │       ├── lit.ts
│   │       ├── envio.ts
│   │       └── agent.ts
│   ├── scripts/                # Helper scripts
│   │   ├── create-pkp.js       # PKP creation
│   │   └── setup-envio.js      # Envio setup
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                     # Express backend
│   ├── services/
│   │   ├── ai-agent.ts         # AI decision engine
│   │   └── execution-engine.ts # Transaction execution
│   ├── index.ts                # Main server
│   └── package.json
│
├── envio/                       # Envio indexer
│   ├── src/
│   │   └── handlers.ts         # Event handlers
│   ├── abis/
│   │   └── erc20.json          # Token ABI
│   └── config.yaml             # Indexer config
│
├── lit-actions/                 # Lit Protocol actions
│   └── signing-policy.js       # Autonomous signing policy
│
├── docker-compose.yml          # Docker orchestration
├── package.json                # Root package.json (workspaces)
├── .env.local                  # Environment variables
├── README.md                   # Main documentation
├── STRUCTURE.md                # Structure overview
└── tasks.md                    # Development tasks
```

---

## 🔧 Technology Deep Dive

### 1. Avail Nexus SDK Integration

**Purpose**: Unified cross-chain balance fetching and bridging

**Implementation Location**: `/frontend/src/lib/nexus/`

**Key Features**:
- ✅ **Multi-chain balance aggregation**: Fetch balances across 11+ chains simultaneously
- ✅ **Unified API**: Single interface for all supported networks
- ✅ **Bridge simulation**: Preview costs before execution
- ✅ **Intent management**: User approval workflows
- ✅ **Cost optimization**: Compare direct vs chain abstraction methods

**Supported Networks** (17 total):
- **Mainnet**: Ethereum (1), Optimism (10), Polygon (137), Arbitrum (42161), Avalanche (43114), Base (8453), Scroll (534351), Sophon (50104), Kaia (8217), BNB Chain (56), HyperEVM (9000000)
- **Testnet**: Sepolia (11155111), Optimism Sepolia (11155420), Polygon Amoy (80002), Arbitrum Sepolia (421614), Base Sepolia (84532), Monad Testnet (1014)

**Code Example**:
```typescript
// Initialize Nexus SDK
const sdk = new NexusSDK({
  endpoint: 'https://api.nexus.avail.so',
  chains: [1, 10, 137, 42161, 43114, 8453]
});

// Get unified balances
const balances = await sdk.getBalances(address);

// Simulate bridge
const simulation = await sdk.simulateBridge({
  token: 'USDC',
  amount: '100',
  chainId: 137
});

// Execute bridge with user approval
sdk.setOnIntentHook(({ intent, allow, deny }) => {
  // User reviews and approves/denies
});
```

**Files**:
- `client.ts`: SDK initialization and configuration
- `balances.ts`: Balance fetching and aggregation logic
- `bridge.ts`: Bridge simulation and execution

---

### 2. Lit Protocol PKP Integration

**Purpose**: Programmable security and autonomous signing with conditional policies

**Implementation Location**: `/frontend/src/lib/lit/` and `/lit-actions/`

**Key Features**:
- ✅ **PKP Wallet Management**: Create and manage programmable key pairs
- ✅ **Session Signatures**: Time-limited authentication
- ✅ **Conditional Signing**: Policy-based transaction approval
- ✅ **Autonomous Operations**: Sign transactions without manual approval when conditions are met

**Security Policies** (implemented in Lit Actions):
1. **Amount Limits**: Max $100 per transaction
2. **Chain Allowlist**: Only approved chains (Ethereum, Optimism, Polygon, Arbitrum)
3. **Gas Thresholds**: Only sign when gas < 200 Gwei
4. **Token Allowlist**: USDC, USDT, ETH only
5. **Cooldown Period**: 5-minute cooldown between signatures

**Code Example**:
```typescript
// Initialize Lit client
const litNodeClient = new LitNodeClient({
  litNetwork: LIT_NETWORK.DatilDev
});

// Get session signatures
const sessionSigs = await litNodeClient.getPkpSessionSigs({
  pkpPublicKey: yourPKPPublicKey,
  authMethods: [authMethod],
  chain: "ethereum",
  expiration: new Date(Date.now() + 3600000).toISOString()
});

// Execute Lit Action with policy
const result = await litNodeClient.executeJs({
  code: signingPolicyCode,
  sessionSigs,
  jsParams: {
    toSign,
    publicKey: pkpPublicKey,
    transactionData: JSON.stringify(txData),
    policy: customPolicy
  }
});
```

**Lit Action Policy Validation** (`/lit-actions/signing-policy.js`):
```javascript
// Validate amount
if (txData.amount > policy.maxAmount) {
  return { success: false, error: 'Amount exceeds limit' };
}

// Validate chain
if (!policy.allowedChains.includes(txData.chainId)) {
  return { success: false, error: 'Chain not allowed' };
}

// Sign if all validations pass
const sigShare = await Lit.Actions.signEcdsa({
  toSign, publicKey, sigName
});
```

**Files**:
- `client.ts`: Lit Node Client setup
- `pkp-wallet.ts`: PKP creation and management
- `session-sigs.ts`: Session signature generation
- `autonomous-signer.ts`: Autonomous signing logic
- `policy-engine.ts`: Policy validation
- `/lit-actions/signing-policy.js`: Lit Action code

---

### 3. Envio HyperIndex/HyperSync Integration

**Purpose**: Real-time multi-chain data intelligence and event monitoring

**Implementation Location**: `/envio/` and `/frontend/src/lib/envio/`

**Key Features**:
- ✅ **Multi-chain indexing**: Monitor events across Ethereum, Polygon, Arbitrum
- ✅ **High-performance**: Process 5,000+ events/second using HyperSync
- ✅ **ERC-20 tracking**: Monitor USDC/USDT transfers
- ✅ **High-value alerts**: Flag transfers >$10k for AI analysis
- ✅ **Gas monitoring**: Track optimal gas conditions

**Monitored Contracts**:
- **Ethereum USDC**: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
- **Polygon USDC**: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
- **Arbitrum USDC**: 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8

**Event Handlers** (`/envio/src/handlers.ts`):
```typescript
export async function handleTransfer(event: Transfer) {
  const usdValue = calculateUSDValue(event.params.value, event.chainId);
  
  // Flag high-value transfers for AI monitoring
  if (usdValue > 10000) {
    console.log('AI Alert: High-value transfer detected');
    // Trigger AI agent analysis
  }
}

export async function handleBlock(event: any) {
  const gasPriceGwei = parseFloat(event.block.gasPrice) / 1e9;
  
  if (gasPriceGwei < 50) {
    console.log('AI Alert: Optimal gas conditions detected');
    // Trigger AI agent to execute pending transactions
  }
}
```

**Configuration** (`/envio/config.yaml`):
```yaml
name: WalletMonitor
networks:
  - id: 1    # Ethereum
    start_block: 18500000
  - id: 137  # Polygon
    start_block: 48000000
  - id: 42161 # Arbitrum
    start_block: 140000000

contracts:
  - name: USDC_Ethereum
    abi_file_path: ./abis/erc20.json
    address:
      - address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    handler: ./src/handlers.ts
    events:
      - event: Transfer(address indexed from, address indexed to, uint256 value)
```

---

## 🤖 AI Agent Architecture

**Location**: `/backend/services/ai-agent.ts`

### Decision Engine

The AI agent makes autonomous decisions based on:
1. **Portfolio data** from Avail Nexus
2. **On-chain events** from Envio
3. **Security policies** from Lit Protocol
4. **Market conditions** (gas prices, yields)

### Agent Capabilities (Planned)

1. **Portfolio Optimization**: Automatically rebalance across chains
2. **Gas Optimization**: Execute transactions at optimal times
3. **Yield Farming**: Identify and participate in high-yield opportunities
4. **Risk Management**: Enforce spending limits and risk parameters
5. **Cross-Chain Arbitrage**: Exploit price differences across chains

### Current Implementation Status

```typescript
export class AIAgent {
  private isActive = false;

  async analyze(portfolioData: any): Promise<AgentDecision> {
    // Decision logic based on:
    // - Portfolio composition
    // - Gas prices
    // - Yield opportunities
    // - Risk parameters
    
    return {
      action: 'hold' | 'bridge' | 'yield' | 'rebalance',
      confidence: 0.8,
      reasoning: 'Portfolio balanced',
      estimatedGain: 0
    };
  }
}
```

---

## 🎨 Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Hooks

### Key Components

#### 1. Dashboard (`/components/Dashboard.tsx`)
- Main container with tab navigation
- Integrates all sub-components
- 4 tabs: Portfolio, Bridge, AI Agent, PKP Auth

#### 2. Portfolio Overview (`/components/PortfolioOverview.tsx`)
- Displays unified balances across all chains
- Uses Nexus BalanceWidget
- Real-time updates from Envio

#### 3. Bridge Dashboard (`/components/BridgeDashboard.tsx`)
- Cross-chain bridging interface
- Intent simulation and approval
- Progress tracking

#### 4. Agent Control Panel (`/components/agent/ControlPanel.tsx`)
- Start/stop autonomous agent
- Configure policies
- Monitor agent status and actions

#### 5. PKP Authentication (`/components/auth/PKPAuth.tsx`)
- PKP wallet creation
- Authentication method selection
- Session management

### Widget Integration

The project uses pre-built Nexus Widgets:
- **BalanceWidget**: Shows balances across chains
- **BridgeWidget**: Provides bridge interface
- **NexusWidgetProvider**: Context provider for widgets

---

## 🔌 Backend Architecture

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Communication**: WebSocket for real-time updates

### API Endpoints

```
GET  /api/health            - Health check
GET  /api/agent/status      - AI agent status
GET  /api/portfolio/:address - Portfolio data
```

### WebSocket Events

```
connected              - Client connected
portfolio_update       - Portfolio data changed
agent_action           - AI agent took action
high_value_transfer    - Large transfer detected
gas_alert              - Optimal gas conditions
```

### Services

1. **AI Agent Service** (`/services/ai-agent.ts`)
   - Decision-making logic
   - Portfolio analysis
   - Action execution

2. **Execution Engine** (`/services/execution-engine.ts`)
   - Transaction preparation
   - Lit Protocol validation
   - Avail Nexus execution

---

## 🔐 Security Architecture

### Multi-Layer Security

1. **Lit Protocol Layer**
   - Programmable signing policies
   - Conditional transaction approval
   - Session-based authentication
   - Emergency stop mechanisms

2. **Smart Contract Layer**
   - Token approvals with minimum allowance
   - Bridge security through Avail Nexus
   - Multi-chain validation

3. **Application Layer**
   - Input validation
   - Rate limiting
   - Cooldown periods
   - Amount limits

### Policy Enforcement

All autonomous transactions must pass:
1. Amount validation (< $100)
2. Chain allowlist check
3. Gas price validation (< 200 Gwei)
4. Token allowlist check
5. Cooldown period check (5 minutes)

---

## 📊 Performance Metrics

### Target Goals
- ✅ Process 5,000+ events/second using Envio HyperIndex
- ⏳ Execute cross-chain operations in <15 seconds
- ⏳ Maintain 99.9% uptime for autonomous operations
- ⏳ Achieve <$5 average transaction costs through optimization

### Current Implementation Status

#### Phase 1: Foundation ✅ (Complete)
- ✅ Next.js/React project with TypeScript
- ✅ Project structure with organized directories
- ✅ Environment configuration
- ✅ Basic UI components and dashboard

#### Phase 2: Avail Nexus Integration ✅ (Complete)
- ✅ Unified balance fetching across 11+ chains
- ✅ Cross-chain bridging with intent simulation
- ✅ Pre-built UI widgets integration
- ✅ Transaction cost optimization

#### Phase 3: Lit Protocol PKP Integration ✅ (Complete)
- ✅ PKP wallet creation and management
- ✅ Programmable signing policies
- ✅ Session signature management
- ✅ Autonomous transaction signing

#### Phase 4: Envio Integration ✅ (Complete)
- ✅ Multi-chain event indexing
- ✅ Real-time portfolio monitoring
- ✅ Yield opportunity detection
- ✅ Gas price tracking

#### Phase 5: AI Agent Logic ⏳ (In Progress)
- ⏳ Decision engine for portfolio optimization
- ⏳ Risk assessment algorithms
- ⏳ Automated execution pipeline
- ⏳ Performance tracking

#### Phase 6-8: Testing & Deployment ⏳ (Planned)
- ⏳ Unit testing
- ⏳ Integration testing
- ⏳ Security audit
- ⏳ Production deployment

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd eth-online-1

# Install all dependencies
npm run install:all

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Development

```bash
# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend

# Run both frontend and backend
npm run dev

# Run with Docker
docker-compose up
```

### Environment Configuration

Required environment variables (`.env.local`):

```env
# Lit Protocol
LIT_NETWORK=datil-dev
LIT_PKP_PUBLIC_KEY=your_pkp_public_key_here
LIT_AUTH_METHOD=your_auth_method_here

# Avail Nexus
AVAIL_NEXUS_ENDPOINT=https://api.nexus.avail.so
SUPPORTED_CHAINS=1,10,137,42161,43114,8453

# Envio
ENVIO_GRAPHQL_ENDPOINT=your_envio_graphql_endpoint
HYPERSYNC_ENDPOINTS={"1":"https://eth.hypersync.xyz","10":"https://optimism.hypersync.xyz","137":"https://polygon.hypersync.xyz","42161":"https://arbitrum.hypersync.xyz"}

# General
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

---

## 🔄 Integration Flow

### Example: Autonomous Portfolio Rebalancing

```
1. Envio detects high-value yield opportunity on Arbitrum
   ↓
2. Event triggers AI Agent analysis
   ↓
3. AI Agent decides to bridge USDC from Ethereum to Arbitrum
   ↓
4. Lit Protocol validates transaction against policies:
   - Amount: $50 (✓ < $100)
   - Chain: 1 → 42161 (✓ allowed)
   - Gas: 30 Gwei (✓ < 200 Gwei)
   - Token: USDC (✓ allowed)
   ↓
5. Lit Action signs transaction automatically
   ↓
6. Avail Nexus executes bridge with optimal routing
   ↓
7. Envio tracks transaction and updates portfolio
   ↓
8. Frontend displays real-time status update
```

---

## 📚 Key Documentation References

### Avail Nexus
- [API Reference](https://docs.availproject.org/nexus/avail-nexus-sdk/nexus-core/api-reference)
- [Demo Repository](https://github.com/availproject/avail-nexus-demo)
- [Widgets API](https://docs.availproject.org/nexus/avail-nexus-sdk/examples/nexus-widgets/api-reference)

### Lit Protocol
- [PKP Overview](https://developer.litprotocol.com/user-wallets/pkps/overview)
- [Session Signatures](https://developer.litprotocol.com/sdk/authentication/session-sigs/intro)
- [Programmable Signing](https://developer.litprotocol.com/learninglab/intro-to-lit/prog-signing)

### Envio
- [HyperIndex Overview](https://docs.envio.dev/docs/HyperIndex/overview)
- [Getting Started](https://docs.envio.dev/docs/HyperIndex/getting-started)
- [Supported Networks](https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks)

---

## 🎯 Use Cases

### 1. Cross-Chain Portfolio Management
- View unified balances across all chains
- Rebalance assets automatically
- Optimize gas costs by timing transactions

### 2. Yield Optimization
- Monitor yield opportunities across chains
- Automatically move funds to highest yields
- Compound earnings automatically

### 3. Gas Optimization
- Track gas prices in real-time
- Execute transactions during low-gas periods
- Save on transaction costs

### 4. Risk Management
- Enforce spending limits
- Restrict to allowed chains and tokens
- Emergency stop functionality

### 5. Autonomous Operations
- Set policies and let the agent work
- No manual approvals needed for valid transactions
- Full audit trail of all actions

---

## 🔍 Code Quality & Best Practices

### TypeScript Usage
- ✅ Strict type checking enabled
- ✅ Well-defined interfaces for all data structures
- ✅ Type-safe API calls

### React Best Practices
- ✅ Functional components with hooks
- ✅ Client components marked with 'use client'
- ✅ Proper state management
- ✅ Component reusability

### Security Best Practices
- ✅ Input validation
- ✅ Environment variables for sensitive data
- ✅ Minimum token allowances
- ✅ Multi-layer validation (frontend + Lit Protocol)

---

## 🚧 Current Limitations

1. **AI Agent Logic**: Basic decision engine (needs advanced ML models)
2. **Testing**: No comprehensive test suite yet
3. **Monitoring**: Limited production monitoring
4. **Documentation**: API documentation could be more detailed
5. **Error Handling**: Could be more robust in edge cases

---

## 🛣️ Future Roadmap

### Short Term (1-2 months)
- [ ] Complete AI agent decision engine
- [ ] Add comprehensive testing
- [ ] Improve error handling
- [ ] Add more yield sources
- [ ] Deploy to testnet

### Medium Term (3-6 months)
- [ ] Advanced ML models for decision-making
- [ ] Support for more chains (20+)
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Mainnet deployment

### Long Term (6-12 months)
- [ ] DAO governance for policies
- [ ] Community-driven strategies
- [ ] Integration with DeFi protocols
- [ ] Advanced risk models
- [ ] Multi-user support

---

## 🤝 Contributing

This is a hackathon project built for ETHOnline 2024. Key areas for contribution:
1. AI decision algorithms
2. Additional chain support
3. UI/UX improvements
4. Testing infrastructure
5. Documentation

---

## 📝 Summary

This Cross-Chain AI Wallet Agent represents a sophisticated integration of three powerful blockchain technologies:

1. **Avail Nexus** provides the cross-chain infrastructure, enabling seamless operations across 11+ networks with optimized routing and cost estimation.

2. **Lit Protocol** adds programmable security, allowing autonomous operations while maintaining strict policy enforcement and user control.

3. **Envio** delivers real-time multi-chain intelligence, providing the data foundation for AI-driven decision-making.

Together, these technologies create an autonomous system capable of:
- Managing portfolios across multiple chains
- Making intelligent rebalancing decisions
- Optimizing transaction costs
- Enforcing security policies
- Operating 24/7 without manual intervention

The project demonstrates cutting-edge blockchain development practices, including modern TypeScript, React patterns, multi-chain architecture, and programmable security models.

**Status**: Core infrastructure complete (Phases 1-4), AI logic in development (Phase 5), testing and deployment planned (Phases 6-8).

---

## 📞 Support & Resources

- **Main Documentation**: [README.md](./README.md)
- **Development Tasks**: [tasks.md](./tasks.md)
- **Project Structure**: [STRUCTURE.md](./STRUCTURE.md)
- **GitHub Repository**: https://github.com/jayasurya0007/eth-online-1

Built with ❤️ for ETHOnline 2024
