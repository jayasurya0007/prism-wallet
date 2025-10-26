# Quick Start Guide - Cross-Chain AI Wallet Agent

## 🎯 What This Project Does

This is an **autonomous AI wallet agent** that manages your crypto portfolio across **11+ blockchain networks** automatically. Think of it as a smart assistant that:
- Monitors your balances across all chains in one place
- Finds the best yield opportunities
- Moves funds between chains when it makes sense
- Executes transactions when gas is cheap
- All while following strict security policies YOU set

## 🚀 5-Minute Setup

### Step 1: Prerequisites
```bash
# Check you have Node.js 18+
node --version  # Should be 18.0.0 or higher

# Check you have npm
npm --version
```

### Step 2: Clone & Install
```bash
# Clone the repository
git clone https://github.com/jayasurya0007/eth-online-1.git
cd eth-online-1

# Install all dependencies (frontend + backend)
npm run install:all
```

This will take 2-3 minutes.

### Step 3: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your preferred editor
nano .env.local  # or vim, code, etc.
```

**Minimal configuration** (just to run locally):
```env
# For development, you can leave most as-is
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_ENABLE_TESTNETS=true

# Optional: Add your WalletConnect Project ID for wallet integration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

### Step 4: Run the Application

**Option A: Run Everything (Recommended for first time)**
```bash
npm run dev
```
This starts both frontend (port 3000) and backend (port 8000).

**Option B: Run Individual Components**
```bash
# Terminal 1: Frontend only
npm run dev:frontend

# Terminal 2: Backend only (in another terminal)
npm run dev:backend
```

### Step 5: Open Your Browser
Navigate to: **http://localhost:3000**

You should see the Cross-Chain AI Wallet Agent dashboard! 🎉

---

## 🎮 Using the Dashboard

### Tab 1: Portfolio
- View your token balances across all supported chains
- See aggregated totals
- Real-time price updates

**Try it**: Enter a wallet address in the BalanceWidget to see cross-chain balances.

### Tab 2: Bridge
- Move tokens between chains
- See cost estimates before bridging
- Compare direct vs chain-abstraction methods

**Try it**: Simulate a bridge from Ethereum to Polygon to see the cost breakdown.

### Tab 3: AI Agent
- Start/stop autonomous operations
- Configure policies (max amounts, allowed chains, gas limits)
- View agent status and recent actions

**Try it**: Configure a policy and see what the agent would do.

### Tab 4: PKP Auth
- Create programmable key pairs (PKP)
- Set up session-based authentication
- Manage permissions

---

## 🔑 Key Features to Explore

### 1. Multi-Chain Balance View
```typescript
// The app automatically fetches balances from:
- Ethereum (ETH)
- Polygon (MATIC)
- Arbitrum (ETH)
- Optimism (ETH)
- Base (ETH)
- Avalanche (AVAX)
- And 5 more chains!
```

### 2. Smart Bridge Simulation
Before executing any bridge, the app:
1. Estimates gas costs
2. Compares routing options
3. Shows you the best method
4. Requires your approval

### 3. Policy-Based Security
The Lit Protocol ensures the AI agent can ONLY:
- Spend up to $100 per transaction
- Use approved chains (you configure)
- Execute when gas < 200 Gwei
- Trade approved tokens only
- Wait 5 minutes between actions

### 4. Real-Time Event Monitoring
Envio tracks:
- All USDC/USDT transfers on 3 chains
- High-value transfers (>$10k) flagged for review
- Gas price changes for optimal execution

---

## 🛠️ Common Tasks

### View Logs
```bash
# Frontend logs (in terminal running npm run dev:frontend)
# Backend logs (in terminal running npm run dev:backend)

# Or check browser console
# Open browser DevTools → Console tab
```

### Stop the Application
```bash
# Press Ctrl+C in the terminal(s) running the app
```

### Restart Fresh
```bash
# Stop the app (Ctrl+C)
# Clear any cached data
rm -rf frontend/.next
# Restart
npm run dev
```

### Build for Production
```bash
# Build frontend
npm run build:frontend

# Build backend
npm run build:backend

# Or build both
npm run build
```

---

## 🐳 Docker Deployment (Alternative)

If you prefer Docker:

```bash
# Build and run all services
docker-compose up

# Run in background
docker-compose up -d

# Stop all services
docker-compose down
```

This starts:
- Frontend on port 3000
- Backend on port 8000
- Envio indexer on port 8080

---

## 🧪 Testing Features

### Test 1: Check Balance Aggregation
1. Go to Portfolio tab
2. Enter address: `0x742d35Cc6634C0532925a3b8D400e5e5c8C8b8b8`
3. Should see balances across multiple chains
4. Check console for API calls

### Test 2: Simulate a Bridge
1. Go to Bridge tab
2. Select from: Ethereum, to: Polygon
3. Token: USDC, Amount: 100
4. Click "Simulate"
5. Review cost estimate

### Test 3: Configure AI Agent
1. Go to AI Agent tab
2. Set max amount: $50
3. Select allowed chains
4. Set gas limit: 150 Gwei
5. Save policy
6. Agent will only execute within these limits

---

## 📊 Supported Networks

### Mainnet (Production)
| Chain | Chain ID | Native Token |
|-------|----------|--------------|
| Ethereum | 1 | ETH |
| Optimism | 10 | ETH |
| Polygon | 137 | MATIC |
| Arbitrum | 42161 | ETH |
| Avalanche | 43114 | AVAX |
| Base | 8453 | ETH |
| Scroll | 534351 | ETH |
| BNB Chain | 56 | BNB |
| + 3 more | | |

### Testnet (Development)
| Chain | Chain ID | Purpose |
|-------|----------|---------|
| Sepolia | 11155111 | Ethereum testnet |
| Base Sepolia | 84532 | Base testnet |
| Polygon Amoy | 80002 | Polygon testnet |
| Arbitrum Sepolia | 421614 | Arbitrum testnet |
| Optimism Sepolia | 11155420 | Optimism testnet |

---

## 🔧 Troubleshooting

### Issue: "Module not found"
**Solution**: Make sure you ran `npm run install:all`

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
PORT=3001 npm run dev:frontend
```

### Issue: "Cannot connect to backend"
**Solution**: 
1. Make sure backend is running (npm run dev:backend)
2. Check backend is on port 8000: http://localhost:8000/api/health
3. Should return: `{"status":"ok"}`

### Issue: Nexus SDK errors
**Solution**: 
1. Make sure you have an internet connection
2. Check AVAIL_NEXUS_ENDPOINT in .env.local
3. Default endpoint should work: https://api.nexus.avail.so

### Issue: TypeScript errors
**Solution**:
```bash
# Run type check
cd frontend && npm run type-check
# Fix any errors shown
```

---

## 📚 Next Steps

### Learn More
1. **Deep Dive**: Read [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) for full architecture
2. **Development**: Check [tasks.md](./tasks.md) for implementation roadmap
3. **Docs**: Read [README.md](./README.md) for complete overview

### Try Advanced Features
1. **Create a PKP**: Use scripts/create-pkp.js to create your own programmable wallet
2. **Deploy Envio**: Run the indexer to monitor real blockchain events
3. **Customize Agent**: Modify AI decision logic in backend/services/ai-agent.ts

### Contribute
1. Pick an issue from tasks.md
2. Make changes in a new branch
3. Test thoroughly
4. Submit a PR

---

## 🎓 Understanding the Code

### Frontend Entry Point
`frontend/src/app/page.tsx` → `components/Dashboard.tsx`

### Backend Entry Point
`backend/index.ts` → Express server + WebSocket

### Nexus Integration
`frontend/src/lib/nexus/client.ts` → All Avail Nexus logic

### Lit Protocol Integration
`frontend/src/lib/lit/` → PKP and signing logic
`lit-actions/signing-policy.js` → Autonomous signing rules

### Envio Integration
`envio/src/handlers.ts` → Event processing
`envio/config.yaml` → Indexer configuration

---

## 💡 Pro Tips

1. **Development Mode**: Use testnet chains first (enable via .env.local)
2. **Gas Optimization**: The agent waits for gas < 50 Gwei before executing
3. **Security First**: Always test policies with small amounts first
4. **Real-time Updates**: WebSocket connects automatically for live updates
5. **Chain Selection**: Start with 2-3 chains, then expand

---

## 📞 Need Help?

1. **Check Console**: Browser DevTools → Console for errors
2. **Check Logs**: Terminal output for backend/frontend logs
3. **Review Docs**: 
   - [Avail Nexus Docs](https://docs.availproject.org/nexus/)
   - [Lit Protocol Docs](https://developer.litprotocol.com/)
   - [Envio Docs](https://docs.envio.dev/)
4. **GitHub Issues**: Open an issue on the repository

---

## ✅ Checklist: First-Time Setup

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm run install:all`)
- [ ] .env.local configured
- [ ] Frontend running (http://localhost:3000)
- [ ] Backend running (http://localhost:8000)
- [ ] Dashboard loads in browser
- [ ] Can switch between tabs
- [ ] Balance widget shows sample data

**All done? You're ready to explore! 🚀**

---

Built for ETHOnline 2024 | Powered by Avail, Lit Protocol, and Envio
