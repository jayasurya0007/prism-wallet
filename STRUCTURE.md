# Clean Project Structure

```
project1/
├── 🎨 FRONTEND/
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # SDK integrations
│   │   ├── hooks/               # React hooks
│   │   └── types/               # TypeScript types
│   ├── package.json
│   ├── Dockerfile
│   └── next.config.js
│
├── 🔧 BACKEND/
│   ├── services/                # Core services
│   │   └── ai-agent.ts         # AI decision engine
│   ├── routes/                  # API endpoints
│   ├── types/                   # Backend types
│   ├── index.ts                 # Main server
│   ├── package.json
│   └── Dockerfile
│
├── ⛓️ ENVIO
│   ├── src/
│   │   └── handlers.ts         # Event handlers
│   ├── abis/
│   │   └── erc20.json          # Token ABI
│   └── config.yaml             # Indexer config
│
├── 🔐 LIT-ACTIONS
│   └── signing-policy.js        # Autonomous signing
│
└── 📄 CONFIG
    ├── .env.local              # Environment vars
    ├── docker-compose.yml      # Deployment
    └── tasks.md                # Development tasks
```

## 🚀 Quick Start

1. **Install All**: `npm run install:all`
2. **Frontend**: `npm run dev:frontend`
3. **Backend**: `npm run dev:backend`
4. **Both**: `npm run dev`
5. **Envio**: `cd envio && envio dev`
6. **Full Stack**: `docker-compose up`

## 🔄 Data Flow

```
Frontend ↔ Backend ↔ Envio ↔ Blockchains
```

Clean, minimal, and production-ready.