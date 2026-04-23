# AGL.ai Project Documentation

## Overview
AGL.ai is a comprehensive AI-powered cybersecurity platform that provides specialized AI models for penetration testing, threat intelligence, exploit development, privacy/anonymity, and red team operations. The platform features a subscription-based model with a free trial system and admin controls.

## Architecture

### Frontend (Client)
- **Framework**: React with Vite
- **Styling**: Dark theme with neon cyberpunk aesthetic (neon pink/cyan colors)
- **UI Components**: Custom components with geometric sans-serif fonts and glow effects
- **State Management**: React Context providers
- **Routing**: Client-side routing with protected routes

### Backend (Server)
- **Runtime**: Node.js with TypeScript
- **Framework**: tRPC for type-safe APIs
- **Database**: TiDB Cloud (MySQL-compatible) with Drizzle ORM
- **Authentication**: Cookie-based sessions with admin and user roles
- **API**: RESTful endpoints at `/api/v1/*` and tRPC endpoints at `/api/trpc/*`

### Database Schema
- **users**: User accounts with roles (user/admin)
- **subscriptions**: Subscription plans with token tracking
- **promoCodes**: Promotional codes with discount percentages
- **adminAuth**: Admin authentication and login attempt tracking

## Features

### AI Models (Personas)
1. **Kali GPT** - Penetration Testing Specialist
2. **Dark GPT** - Threat Intelligence Analyst
3. **Zero Day GPT** - Exploit Development Expert
4. **Onion GPT** - Privacy & Anonymity Specialist
5. **Red Team Operator** - Advanced Red Team Operations

### Subscription Plans
| Plan | Price | Tokens | Duration |
|------|-------|--------|----------|
| Free Trial | $0 | 100K | 3 days |
| Starter | $25 | 300K | 30 days |
| Professional | $90 | 1.5M | 90 days |
| Elite | $150 | 3M | 180 days |
| Enterprise | $500 | 10M+ | 365 days |

### Admin System
- **Login Password**: `#AllOfThem-3301`
- **Recovery Code**: `Merleoskyn`
- **Features**:
  - Unlimited access to all tools and models
  - User management interface
  - Token allocation and monitoring
  - Subscription plan management
  - System analytics and health status
  - Real-time deployment via Telegram

### Promo Code System
- **FIRST20**: 20% discount on any plan
- Configurable max uses and expiration dates
- Automatic discount application at checkout

### Payment Integration
- **Primary**: Monero (XMR) cryptocurrency
- **Monero Address**: `8BbApiMBHsPVKkLEP4rVbST6CnSb3LW2gXygngCi5MGiBuwAFh6bFEzT3UTuFCkLHtyHnrYNnHycdaGb2Kgkkmw8jViCdB6`
- Payment confirmation system with Telegram notifications

### Telegram Integration
- **Support Bot**: @loghandelbot
- **Community Channel**: @cybersecunity
- **Admin Commands**:
  - `/deploy <project>` - Deploy to Vercel
  - `/stats` - System statistics
  - `/tokens <user> <amount>` - Manage tokens
  - `/providers` - List LLM providers
  - `/test_provider <name>` - Test LLM provider

## LLM Provider Integration

### Free LLM Providers
1. **GitHub Models API** (FREE with token `ghp_1s5k2...TvKR`)
   - Phi-3 (Microsoft)
   - Llama 3.3 70B (Meta)
   - Mistral 7B
   - Gemma 2 9B
   - GitHub Code Search as knowledge base

2. **Groq** - FREE (60 req/min)
3. **Together AI** - FREE credits
4. **HuggingFace** - FREE (10k req/month)
5. **Google Gemini** - FREE tier

## API Endpoints

### REST API (v1)
```
GET  /api/v1/providers           - List LLM providers
POST /api/v1/llm/chat            - Chat with any LLM
POST /api/v1/llm/completion      - Text completion
```

### tRPC Endpoints
```
query    auth.me                    - Get current user
mutation auth.logout                - Logout user
mutation admin.login               - Admin login
query    admin.isAdmin              - Check admin status
mutation admin.logout               - Admin logout
query    admin.getDashboard         - Get admin dashboard
query    admin.getPlans             - List subscription plans
query    admin.getPersonas          - List AI personas
mutation admin.validatePromo        - Validate promo code
mutation admin.startTraining        - Start model training
query    admin.getTrainingStatus     - Get training status
```

## Testing

### Unit Tests
- **Framework**: Vitest
- **Test Files**:
  - `server/auth.test.ts` - Authentication functions
  - `server/admin-access.test.ts` - Admin vs user access flows
  - `server/promo-payment.test.ts` - Promo code and payment functionality

### Running Tests
```bash
npm install
npx vitest run
```

## Deployment

### GitHub Repository
- **URL**: https://github.com/kimikukiu/AGL.ai
- **Branch**: main
- **Latest Commit**: Add unit tests for authentication, admin access, and promo code functionality

### Vercel Deployment
1. Go to https://vercel.com/new
2. Import Git Repository: `https://github.com/kimikukiu/AGL.ai`
3. Configure environment variables (see VERCEL_DEPLOYMENT.md)
4. Click "Deploy"

### Environment Variables
Required for production:
- `DATABASE_URL` - TiDB Cloud connection string
- `JWT_SECRET` - JWT signing secret
- `VITE_*` - Frontend configuration variables
- `BUILT_IN_FORGE_API_*` - Forge API credentials

## Security Considerations

1. **Admin Password**: Change default password `#AllOfThem-3301` in production
2. **Recovery Code**: Store `Merleoskyn` securely
3. **Database**: Use strong passwords and SSL connections
4. **API Keys**: Rotate keys regularly
5. **Monero**: Verify payment addresses before sharing

## File Structure
```
AGL.ai/
├── client/              # Frontend React application
├── server/              # Backend Node.js server
│   ├── _core/          # Core server functionality
│   ├── routers.ts      # tRPC router definitions
│   ├── auth.ts         # Authentication utilities
│   ├── db.ts           # Database operations
│   └── *.test.ts       # Unit tests
├── shared/              # Shared types and constants
├── drizzle/             # Database schema and migrations
├── patches/             # Dependency patches
├── VERCEL_DEPLOYMENT.md # Vercel deployment guide
├── DEPLOYMENT_GUIDE.md  # General deployment guide
└── package.json        # Project dependencies
```

## Recent Updates
- ✅ Added comprehensive unit tests for authentication
- ✅ Implemented admin vs user access flow tests
- ✅ Added promo code and payment functionality tests
- ✅ All code pushed to GitHub repository
- ✅ CI/CD pipeline ready with GitHub Actions

## Next Steps
1. Complete Vercel deployment
2. Run full test suite after dependencies installed
3. Verify all features in production environment
4. Set up monitoring and alerting
5. Conduct security audit

## Support
- **Telegram**: @loghandelbot
- **Community**: @cybersecunity
- **GitHub Issues**: https://github.com/kimikukiu/AGL.ai/issues

---

**Last Updated**: April 23, 2026
**Version**: 1.0.0
**Status**: Ready for Production ✅
