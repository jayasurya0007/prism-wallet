# Cross-Chain AI Wallet Agent - Development Rules

## 📋 Core Development Rules

### 1. Documentation Reference Requirements
- **ALWAYS** reference official documentation before implementation
- **MANDATORY** documentation sources:
  - [Avail Nexus API Reference](https://docs.availproject.org/nexus/avail-nexus-sdk/nexus-core/api-reference)
  - [Nexus Widgets API](https://docs.availproject.org/nexus/avail-nexus-sdk/examples/nexus-widgets/api-reference)
  - [Lit Protocol PKP Overview](https://developer.litprotocol.com/user-wallets/pkps/overview)
  - [Lit Protocol Session Signatures](https://developer.litprotocol.com/sdk/authentication/session-sigs/intro)
  - [Lit Protocol Programmable Signing](https://developer.litprotocol.com/learninglab/intro-to-lit/prog-signing)
  - [Envio HyperIndex Overview](https://docs.envio.dev/docs/HyperIndex/overview)
  - [Envio Getting Started](https://docs.envio.dev/docs/HyperIndex/getting-started)
  - [Envio HyperSync Performance](https://docs.envio.dev/docs/HyperIndex/hypersync)

### 2. Project Structure Compliance
- **FOLLOW** the established directory structure:
  ```
  frontend/src/
  ├── app/                    # Next.js app directory
  ├── components/             # React components
  │   ├── nexus/             # Avail Nexus widgets
  │   ├── auth/              # Authentication components
  │   ├── agent/             # AI agent controls
  │   └── lit/               # Lit Protocol components
  ├── lib/                   # Core libraries
  │   ├── nexus/             # Avail Nexus integration
  │   ├── lit/               # Lit Protocol integration
  │   ├── envio/             # Envio integration
  │   ├── ai/                # AI decision engine
  │   └── agent/             # Agent execution logic
  ├── hooks/                 # React hooks
  ├── types/                 # TypeScript definitions
  └── styles/                # CSS and styling
  
  backend/
  ├── services/              # Core services
  ├── routes/                # API routes
  └── types/                 # Backend types
  
  envio/
  ├── src/                   # Event handlers
  ├── abis/                  # Contract ABIs
  ├── config.yaml            # Indexer configuration
  └── schema.graphql         # GraphQL schema
  
  lit-actions/               # Lit Protocol actions
  ```

### 3. Tasks.md Compliance Rules
- **NEVER** implement features not defined in `tasks.md`
- **ALWAYS** update task completion status: `- [ ]` → `- [x]`
- **MANDATORY** to add ✅ emoji when task is complete
- **REQUIRED** to list all implementation files with ✅ status
- **FOLLOW** the exact phase order: Phase 1 → Phase 2 → Phase 3 → Phase 4
- **UPDATE** tasks.md immediately after completing any task

### 4. Clean Code Standards
- **MINIMAL** implementations - only essential code
- **NO** verbose or unnecessary code
- **SINGLE** responsibility per function/class
- **DESCRIPTIVE** variable and function names
- **CONSISTENT** naming conventions:
  - Components: PascalCase (`BridgeWidget`)
  - Functions: camelCase (`handleBridge`)
  - Files: kebab-case (`bridge-simulation.tsx`)
  - Constants: UPPER_SNAKE_CASE (`SUPPORTED_CHAINS`)

### 5. Implementation Priority Rules
- **OFFICIAL SDK METHODS** over mock implementations
- **REAL API CALLS ONLY** - no mock data in production
- **PRODUCTION-READY** - all integrations must use real endpoints
- **ERROR HANDLING** for all external API calls
- **TYPE SAFETY** - proper TypeScript interfaces
- **SECURITY FIRST** - validate all inputs and permissions
- **NO FALLBACKS TO MOCK** - must fail gracefully if real APIs unavailable

### 6. File Organization Rules
- **ONE** main export per file
- **GROUP** related functionality in same directory
- **SEPARATE** types from implementation
- **INDEX FILES** for clean imports (`components/nexus/index.ts`)
- **CONSISTENT** file extensions (`.ts` for logic, `.tsx` for React)

### 7. Integration Rules
- **AVAIL NEXUS**: Use `NexusSDK` class, implement bridge simulation with real endpoints
- **LIT PROTOCOL**: Use `LitNodeClient`, `PKPEthersWallet`, session signatures with real PKPs
- **ENVIO**: Use HyperIndex config, GraphQL client, event handlers with deployed indexers
- **PRODUCTION ONLY**: No mock data, no fallbacks - real API integrations required
- **REAL ENDPOINTS**: All services must use actual production/testnet endpoints

### 8. Testing & Validation Rules
- **VALIDATE** against official documentation examples
- **TEST** with real API endpoints when possible
- **MOCK** external dependencies appropriately
- **ERROR SCENARIOS** must be handled gracefully

### 9. Environment Configuration Rules
- **USE** `.env.example` as template
- **REFERENCE** environment variables with `process.env`
- **VALIDATE** required environment variables
- **SECURE** sensitive configuration (no hardcoded keys)

### 10. Code Review Checklist
Before marking any task complete, verify:
- [ ] Official documentation referenced and followed
- [ ] File structure matches project organization
- [ ] Implementation is minimal and clean
- [ ] Tasks.md updated with completion status
- [ ] TypeScript interfaces properly defined
- [ ] Error handling implemented
- [ ] Environment variables used correctly
- [ ] No hardcoded values or mock data in production paths

## 🚫 Prohibited Actions
- **NEVER** create files outside established structure
- **NEVER** implement features not in tasks.md
- **NEVER** use mock data in production builds
- **NEVER** hardcode API keys or sensitive data
- **NEVER** skip documentation reference
- **NEVER** leave tasks.md outdated
- **NEVER** deploy with mock endpoints or fake data
- **NEVER** use placeholder APIs in production environment

## ✅ Required Actions
- **ALWAYS** check tasks.md before starting work
- **ALWAYS** reference official documentation
- **ALWAYS** follow established file structure
- **ALWAYS** implement minimal, clean code
- **ALWAYS** update tasks.md completion status
- **ALWAYS** use proper TypeScript types
- **ALWAYS** handle errors gracefully
- **ALWAYS** validate implementation against documentation

## 📊 Current Implementation Status
Based on tasks.md completion:

### ✅ Completed Phases
- **Phase 1**: Project Setup & Foundation (100%)
- **Phase 2**: Avail Nexus SDK Integration (100%)
- **Phase 3**: Lit Protocol PKP Integration (100%)

### 🔄 In Progress Phases
- **Phase 4**: Envio HyperIndex/HyperSync Integration (33%)
- **Phase 5**: AI Agent Core Logic (0%)

### 📋 Next Priority Tasks
1. Complete Task 4.1: HyperIndex Setup
2. Complete Task 4.2: Real-Time Data Intelligence  
3. Complete Task 4.3: GraphQL API Integration
4. Begin Phase 5: AI Agent Core Logic

## 🎯 Success Criteria
- All tasks in tasks.md marked complete ✅
- Official SDK integrations working
- Clean, minimal codebase
- Proper error handling
- Documentation compliance
- Type safety maintained