# Technical Architecture Documentation

## System Architecture Diagrams

### 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USER LAYER                                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Web UI     │  │  Mobile App  │  │   CLI Tool   │             │
│  │  (Browser)   │  │  (Planned)   │  │  (Future)    │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                              │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    FRONTEND (Next.js 14)                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │ │
│  │  │  Dashboard   │  │   Bridge     │  │  AI Agent    │       │ │
│  │  │  Components  │  │  Components  │  │   Control    │       │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │ │
│  │                                                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │ │
│  │  │  Nexus SDK   │  │  Lit Client  │  │Envio GraphQL │       │ │
│  │  │  Integration │  │  Integration │  │    Client    │       │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                             │                                        │
│                             ▼                                        │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    BACKEND (Express + TS)                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │ │
│  │  │  AI Agent    │  │  Execution   │  │  WebSocket   │       │ │
│  │  │   Engine     │  │   Engine     │  │   Server     │       │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      INTEGRATION LAYER                               │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │Avail Nexus   │  │Lit Protocol  │  │    Envio     │             │
│  │   SDK API    │  │   Network    │  │  HyperIndex  │             │
│  │              │  │              │  │  HyperSync   │             │
│  │• Balances    │  │• PKP Mgmt    │  │              │             │
│  │• Bridging    │  │• Signing     │  │• Events      │             │
│  │• Routing     │  │• Policies    │  │• GraphQL     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                                │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │Ethereum  │ │ Polygon  │ │Arbitrum  │ │Optimism  │ ...          │
│  │(Chain 1) │ │(Chain 137)│ │(Chain    │ │(Chain 10)│              │
│  │          │ │          │ │  42161)  │ │          │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                      │
│  11+ Mainnet Chains + 6+ Testnet Chains                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 2. Data Flow Architecture

#### A. User-Initiated Transaction Flow

```
┌──────┐
│ User │ "Bridge 100 USDC from Ethereum to Polygon"
└───┬──┘
    │
    ▼
┌───────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
│                                                            │
│  1. User clicks "Bridge" button                           │
│  2. BridgeDashboard component collects input              │
│  3. Calls nexusClient.estimateBridgeCost()                │
│  4. Shows simulation results to user                      │
│  5. User approves                                         │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                  Avail Nexus SDK                          │
│                                                            │
│  1. sdk.simulateBridge() - Preview costs                 │
│  2. sdk.setOnIntentHook() - Get user confirmation        │
│  3. sdk.setOnAllowanceHook() - Manage token approvals    │
│  4. sdk.executeBridge() - Execute transaction            │
│  5. Track progress with status updates                   │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                    Blockchain Networks                     │
│                                                            │
│  1. Source chain: Lock USDC on Ethereum                  │
│  2. Bridge protocol: Cross-chain message                 │
│  3. Target chain: Mint USDC on Polygon                   │
│  4. Emit Transfer events                                 │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                 Envio HyperSync                           │
│                                                            │
│  1. Detect Transfer events on both chains                │
│  2. Process through handlers.ts                          │
│  3. Store in GraphQL database                            │
│  4. Emit real-time updates                               │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                Frontend (WebSocket Update)                 │
│                                                            │
│  1. Receive event: "bridge_completed"                    │
│  2. Update portfolio display                             │
│  3. Show success notification                            │
└───────────────────────────────────────────────────────────┘
```

#### B. Autonomous Agent Flow

```
┌───────────────────────────────────────────────────────────┐
│                 Envio Event Detection                      │
│                                                            │
│  1. Monitor all USDC/USDT transfers on 3 chains          │
│  2. Detect: "High yield opportunity on Arbitrum: 12% APY"│
│  3. Trigger: handleTransfer() in handlers.ts             │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                   Backend AI Agent                         │
│                                                            │
│  1. Receive event notification                           │
│  2. Fetch current portfolio from Nexus                   │
│  3. Analyze: "Should move 50 USDC to Arbitrum"          │
│  4. Decision: action='bridge', confidence=0.85           │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                Lit Protocol Validation                     │
│                                                            │
│  Policy Checks:                                           │
│  ✓ Amount: 50 USDC < 100 (max limit)                    │
│  ✓ Chain: 1 → 42161 (allowed)                           │
│  ✓ Gas: 45 Gwei < 200 (threshold)                       │
│  ✓ Token: USDC (allowed)                                 │
│  ✓ Cooldown: 6 min > 5 min (ok)                         │
│                                                            │
│  Result: ✓ ALL CHECKS PASSED                             │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                Lit Actions (Signing)                       │
│                                                            │
│  1. Execute signing-policy.js                            │
│  2. Validate transaction data                            │
│  3. Sign transaction with PKP                            │
│  4. Return signature                                     │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                 Execution Engine                          │
│                                                            │
│  1. Receive signed transaction                           │
│  2. Submit to Avail Nexus SDK                            │
│  3. Execute bridge operation                             │
│  4. Monitor transaction status                           │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│              Transaction Execution                         │
│                                                            │
│  Blockchain → Envio → Frontend → User Notification       │
└───────────────────────────────────────────────────────────┘
```

---

### 3. Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│                                                             │
│  ┌──────────────┐                                          │
│  │  Dashboard   │                                          │
│  │  (page.tsx)  │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ├──────────────┬──────────────┬──────────────┐    │
│         ▼              ▼              ▼              ▼    │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │Portfolio │   │  Bridge  │   │AI Agent  │   │PKP Auth  │  │
│  │   Tab    │   │   Tab    │   │   Tab    │   │   Tab    │  │
│  └──────┬───┘   └────┬─────┘   └────┬─────┘   └────┬─────┘  │
│         │            │              │              │        │
│         │            │              │              │        │
│  ┌──────▼───────────▼──────────────▼──────────────▼─────┐ │
│  │              Component Libraries                      │ │
│  │                                                       │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │ │
│  │  │BalanceWidget│ │BridgeWidget│ │PolicyMgr   │    │ │
│  │  └────────────┘  └────────────┘  └────────────┘    │ │
│  └──────┬──────────────┬──────────────┬────────────────┘ │
│         │              │              │                  │
│  ┌──────▼──────────────▼──────────────▼────────────────┐ │
│  │               Integration Layer                      │ │
│  │                                                       │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │ │
│  │  │NexusClient │  │ LitClient  │  │EnvioClient │    │ │
│  │  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘    │ │
│  └─────────┼────────────────┼────────────────┼──────────┘ │
└────────────┼────────────────┼────────────────┼────────────┘
             │                │                │
             ▼                ▼                ▼
    ┌────────────┐   ┌────────────┐   ┌────────────┐
    │Avail Nexus │   │Lit Protocol│   │   Envio    │
    │    API     │   │  Network   │   │  GraphQL   │
    └────────────┘   └────────────┘   └────────────┘
```

---

### 4. Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
│                                                             │
│  Layer 1: Application Security                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ • Input validation (TypeScript type checking)       │  │
│  │ • Address format validation                         │  │
│  │ • Amount bounds checking                            │  │
│  │ • Rate limiting on API calls                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  Layer 2: Policy Enforcement (Lit Protocol)                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Lit Action Policies:                                │  │
│  │ ┌───────────────────────────────────────────────┐  │  │
│  │ │ 1. Amount Limit: maxAmount = $100            │  │  │
│  │ │ 2. Chain Allowlist: [1, 10, 137, 42161]      │  │  │
│  │ │ 3. Gas Threshold: requireGasBelow = 200 Gwei │  │  │
│  │ │ 4. Token Allowlist: [USDC, USDT, ETH]        │  │  │
│  │ │ 5. Cooldown: 300 seconds between signatures  │  │  │
│  │ └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │ Validation Flow:                                    │  │
│  │ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │  │
│  │ │Amount│→│Chain │→│ Gas  │→│Token │→│Time  │ │  │
│  │ │Check │  │Check │  │Check │  │Check │  │Check │ │  │
│  │ └──────┘  └──────┘  └──────┘  └──────┘  └──────┘ │  │
│  │     ↓         ↓         ↓         ↓         ↓     │  │
│  │     └─────────┴─────────┴─────────┴─────────┘     │  │
│  │                      ↓                             │  │
│  │              All Pass? Sign : Reject               │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  Layer 3: Smart Contract Security                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ • Minimum token allowances (not infinite)           │  │
│  │ • Bridge contract validation                        │  │
│  │ • Multi-chain verification                          │  │
│  │ • Slippage protection                               │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  Layer 4: Emergency Controls                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ • Emergency stop button (immediate halt)            │  │
│  │ • Session signature revocation                      │  │
│  │ • Policy override for manual transactions           │  │
│  │ • Audit log of all actions                          │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Database & State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend State                           │
│                                                             │
│  React State (Hooks):                                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ • useState: Component-local state                   │  │
│  │ • useEffect: Side effects, data fetching            │  │
│  │ • Custom hooks: usePortfolioData, useLitPKP         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Session Storage:                                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ • Lit session signatures (temporary)                │  │
│  │ • User preferences                                  │  │
│  │ • Recent transaction hashes                         │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Backend State                            │
│                                                             │
│  In-Memory:                                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ • AI Agent status and configuration                 │  │
│  │ • Active WebSocket connections                      │  │
│  │ • Pending transaction queue                         │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                 Envio Database (PostgreSQL)                 │
│                                                             │
│  Tables/Entities:                                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Transfer:                                           │  │
│  │   - id, from, to, value, timestamp, chainId        │  │
│  │                                                     │  │
│  │ WalletActivity:                                     │  │
│  │   - address, totalVolume, transactionCount         │  │
│  │                                                     │  │
│  │ HighValueTransfer:                                  │  │
│  │   - id, usdValue, flagged, token                   │  │
│  │                                                     │  │
│  │ GasPrice:                                           │  │
│  │   - chainId, gasPrice, timestamp                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  GraphQL API:                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Query: transfers, highValueTransfers, walletStats  │  │
│  │ Subscription: onNewTransfer, onGasPriceChange      │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                 Blockchain State (Immutable)                │
│                                                             │
│  • Token balances across all chains                        │
│  • Transaction history                                     │
│  • Smart contract states                                   │
│  • Gas prices                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Deployment                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Frontend (Vercel/Netlify)              │  │
│  │  ┌───────────────────────────────────────────────┐ │  │
│  │  │ Next.js 14 App (SSR + Client Components)     │ │  │
│  │  │ • Static optimization for pages               │ │  │
│  │  │ • API routes for serverless functions         │ │  │
│  │  │ • Edge functions for real-time features       │ │  │
│  │  └───────────────────────────────────────────────┘ │  │
│  │                        ↕                            │  │
│  │                     CDN Edge                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↕                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │               Backend (AWS/Railway)                 │  │
│  │  ┌───────────────────────────────────────────────┐ │  │
│  │  │ Express Server (Node.js)                      │ │  │
│  │  │ • REST API endpoints                          │ │  │
│  │  │ • WebSocket server                            │ │  │
│  │  │ • AI Agent worker process                     │ │  │
│  │  └───────────────────────────────────────────────┘ │  │
│  │                        ↕                            │  │
│  │              Load Balancer / Reverse Proxy          │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↕                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │            Envio Indexer (Self-Hosted)              │  │
│  │  ┌───────────────────────────────────────────────┐ │  │
│  │  │ Docker Container                              │ │  │
│  │  │ • Envio HyperIndex service                    │ │  │
│  │  │ • PostgreSQL database                         │ │  │
│  │  │ • GraphQL API server                          │ │  │
│  │  └───────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↕                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                External Services                    │  │
│  │  • Avail Nexus API (api.nexus.avail.so)           │  │
│  │  • Lit Protocol Network (datil-dev/mainnet)        │  │
│  │  • RPC Providers (Infura, Alchemy, etc.)           │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Docker Compose (Development):
┌────────────────────────────────────────┐
│  Service: frontend                     │
│  Port: 3000                            │
│  Image: Custom Next.js build          │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  Service: backend                      │
│  Port: 8000                            │
│  Image: Custom Express build          │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  Service: envio                        │
│  Port: 8080                            │
│  Image: envio/hyperindex:latest        │
└────────────────────────────────────────┘
```

---

### 7. Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend Optimizations                      │
│                                                             │
│  1. Code Splitting                                         │
│     • Dynamic imports for heavy components                │
│     • Route-based code splitting (Next.js automatic)      │
│                                                             │
│  2. Caching Strategy                                       │
│     • Static assets: CDN cache (1 year)                   │
│     • API responses: SWR/React Query (stale-while-        │
│       revalidate)                                          │
│     • Balance data: Cache 30 seconds                      │
│                                                             │
│  3. Rendering Strategy                                     │
│     • Static pages: Pre-rendered at build                 │
│     • Dynamic pages: Server-side rendering                │
│     • Interactive components: Client-side only            │
│                                                             │
│  4. Bundle Optimization                                    │
│     • Tree shaking for unused code                        │
│     • Minification and compression                        │
│     • Image optimization (Next.js Image)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 Backend Optimizations                       │
│                                                             │
│  1. Request Handling                                       │
│     • Connection pooling for database                     │
│     • Request debouncing for frequent calls               │
│     • WebSocket for real-time instead of polling          │
│                                                             │
│  2. Data Processing                                        │
│     • Batch processing for multiple chain queries         │
│     • Parallel execution of independent operations        │
│     • Caching of frequently accessed data                 │
│                                                             │
│  3. Resource Management                                    │
│     • Worker threads for CPU-intensive tasks              │
│     • Queue system for async operations                   │
│     • Graceful shutdown handling                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 Envio Optimizations                         │
│                                                             │
│  1. HyperSync Performance                                  │
│     • Target: 5,000+ events/second                        │
│     • Batch processing of events                          │
│     • Parallel indexing across chains                     │
│                                                             │
│  2. Database Optimization                                  │
│     • Indexed columns for frequent queries                │
│     • Partitioning for large tables                       │
│     • Query optimization with EXPLAIN                     │
│                                                             │
│  3. GraphQL Optimization                                   │
│     • DataLoader for batch loading                        │
│     • Query complexity limits                             │
│     • Subscription throttling                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 8. Error Handling & Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│                  Error Handling Flow                        │
│                                                             │
│  User Action                                               │
│       ↓                                                     │
│  Try/Catch Block                                           │
│       ↓                                                     │
│  ┌─────────────────────┐                                   │
│  │  Error Detected?    │                                   │
│  └─────────┬───────────┘                                   │
│            │ Yes                                            │
│            ▼                                                │
│  ┌─────────────────────┐                                   │
│  │  Categorize Error   │                                   │
│  └─────────┬───────────┘                                   │
│            │                                                │
│    ┌───────┴────────┬──────────┬──────────┐              │
│    ▼                ▼          ▼          ▼              │
│  Network        Validation  Policy    System            │
│  Error          Error       Denied    Error             │
│    │                │          │          │              │
│    ▼                ▼          ▼          ▼              │
│  Retry           Show        Show       Log &            │
│  Logic           User        User       Alert            │
│  (3x)            Error       Message    Ops              │
│    │                │          │          │              │
│    └────────────────┴──────────┴──────────┘              │
│                     │                                      │
│                     ▼                                      │
│            Log to Console/Sentry                          │
│                     │                                      │
│                     ▼                                      │
│            Update UI State                                │
│                     │                                      │
│                     ▼                                      │
│            User Notification                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                         │
│                                                             │
│  Application Monitoring:                                   │
│  • Console logs (development)                              │
│  • Sentry (production errors)                              │
│  • Custom analytics events                                 │
│                                                             │
│  Performance Monitoring:                                   │
│  • Web Vitals (LCP, FID, CLS)                             │
│  • API response times                                      │
│  • Transaction success rates                               │
│                                                             │
│  Business Metrics:                                         │
│  • Total value managed                                     │
│  • Number of transactions                                  │
│  • AI agent success rate                                   │
│  • Gas savings achieved                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. **Why Next.js for Frontend?**
- Server-side rendering for better SEO and performance
- Built-in API routes for serverless functions
- Excellent TypeScript support
- Large ecosystem and community

### 2. **Why Express for Backend?**
- Lightweight and flexible
- Easy WebSocket integration
- Familiar to most developers
- Good for MVP and can scale

### 3. **Why Three Separate Services?**
- **Separation of concerns**: Each service has a clear responsibility
- **Scalability**: Can scale each service independently
- **Maintainability**: Easier to update and debug
- **Technology fit**: Each service uses optimal tech stack

### 4. **Why TypeScript Everywhere?**
- Type safety reduces runtime errors
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

### 5. **Why Not a Monolithic Backend?**
- Microservices architecture allows:
  - Independent deployment
  - Technology flexibility
  - Better fault isolation
  - Easier team collaboration

---

## Summary

This architecture provides:
- ✅ **Scalability**: Can handle thousands of users and millions of events
- ✅ **Security**: Multiple layers of validation and policy enforcement
- ✅ **Performance**: Optimized for speed with caching and parallel processing
- ✅ **Maintainability**: Clean separation of concerns and well-documented code
- ✅ **Extensibility**: Easy to add new chains, features, and integrations

The three sponsor technologies (Avail Nexus, Lit Protocol, Envio) are integrated at different layers, each serving a specific purpose, creating a cohesive autonomous wallet management system.
