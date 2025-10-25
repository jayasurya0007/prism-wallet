# Cross-Chain AI Wallet Agent

An autonomous AI wallet agent that leverages three cutting-edge sponsor technologies to provide intelligent cross-chain portfolio management.

## 🚀 Technologies

- **[Avail Nexus SDK](https://docs.availproject.org/nexus/)**: Cross-chain unification and bridging across 11+ mainnet chains
- **[Lit Protocol PKP](https://developer.litprotocol.com/)**: Programmable security and autonomous signing with conditional policies
- **[Envio HyperIndex/HyperSync](https://docs.envio.dev/)**: Real-time multi-chain data intelligence and event monitoring

## 🎯 Features

### Phase 1: Foundation ✅
- [x] Next.js/React project with TypeScript
- [x] Project structure with organized directories
- [x] Environment configuration
- [x] Basic UI components and dashboard

### Phase 2: Avail Nexus Integration (In Progress)
- [ ] Unified balance fetching across 11+ chains
- [ ] Cross-chain bridging with intent simulation
- [ ] Pre-built UI widgets integration
- [ ] Transaction cost optimization

### Phase 3: Lit Protocol PKP Integration (Planned)
- [ ] PKP wallet creation and management
- [ ] Programmable signing policies
- [ ] Session signature management
- [ ] Autonomous transaction signing

### Phase 4: Envio Integration (Planned)
- [ ] Multi-chain event indexing
- [ ] Real-time portfolio monitoring
- [ ] Yield opportunity detection
- [ ] Gas price tracking

### Phase 5: AI Agent Logic (Planned)
- [ ] Decision engine for portfolio optimization
- [ ] Risk assessment algorithms
- [ ] Automated execution pipeline
- [ ] Performance tracking

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── nexus/             # Avail Nexus widgets
│   ├── auth/              # Authentication components
│   └── agent/             # AI agent controls
├── lib/                   # Core libraries
│   ├── nexus/             # Avail Nexus integration
│   ├── lit/               # Lit Protocol integration
│   ├── envio/             # Envio integration
│   ├── ai/                # AI decision engine
│   └── agent/             # Agent execution logic
├── hooks/                 # React hooks
├── types/                 # TypeScript definitions
envio/                     # Envio indexer configuration
lit-actions/               # Lit Protocol actions
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cross-chain-ai-wallet-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and endpoints
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Lit Protocol
LIT_NETWORK=datil-dev
LIT_PKP_PUBLIC_KEY=your_pkp_public_key
LIT_AUTH_METHOD=your_auth_method

# Avail Nexus
AVAIL_NEXUS_ENDPOINT=https://api.nexus.avail.so
SUPPORTED_CHAINS=1,10,137,42161,43114,8453

# Envio
ENVIO_GRAPHQL_ENDPOINT=your_envio_endpoint
HYPERSYNC_ENDPOINTS=your_hypersync_endpoints

# General
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

## 🌐 Supported Networks

### Mainnet Chains
- Ethereum (1)
- Optimism (10) 
- Polygon (137)
- Arbitrum (42161)
- Avalanche (43114)
- Base (8453)
- Scroll (534351)
- Sophon (50104)
- Kaia (8217)
- BNB Chain (56)
- HyperEVM (9000000)

### Testnet Chains
- Sepolia (11155111)
- Optimism Sepolia (11155420)
- Polygon Amoy (80002)
- Arbitrum Sepolia (421614)
- Base Sepolia (84532)
- Monad Testnet (1014)

## 🤖 AI Agent Capabilities

The autonomous agent will provide:

1. **Portfolio Optimization**: Automatically rebalance assets across chains for optimal yields
2. **Gas Optimization**: Monitor gas prices and execute transactions at optimal times
3. **Yield Farming**: Identify and participate in high-yield opportunities
4. **Risk Management**: Enforce spending limits and risk parameters
5. **Cross-Chain Arbitrage**: Exploit price differences across chains

## 🔒 Security Features

- **Programmable Signing Policies**: Lit Protocol PKP enforces spending limits and allowed actions
- **Session-Based Authentication**: Time-limited signatures for enhanced security
- **Multi-Chain Validation**: Cross-reference data across multiple chains
- **Emergency Stop**: Immediate halt of all autonomous operations

## 📊 Performance Metrics

Target performance goals:
- Process 5,000+ events/second using Envio HyperIndex
- Execute cross-chain operations in <15 seconds
- Maintain 99.9% uptime for autonomous operations
- Achieve <$5 average transaction costs through optimization

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📚 Documentation

- [Avail Nexus SDK Documentation](https://docs.availproject.org/nexus/)
- [Lit Protocol Developer Docs](https://developer.litprotocol.com/)
- [Envio Documentation](https://docs.envio.dev/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Acknowledgments

Built for ETHOnline 2024 hackathon, leveraging:
- Avail Nexus for cross-chain infrastructure
- Lit Protocol for programmable security
- Envio for real-time data intelligence