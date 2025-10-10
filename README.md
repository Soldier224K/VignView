# 🏪 Stock Line - Smart Stock, Simple Shop

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)
[![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)]()

> AI-assisted retail management system for small to medium businesses in India

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Stock Line** is an affordable, AI-powered retail management system designed specifically for small retailers in India. It helps businesses:

- 📦 Track inventory intelligently
- 💰 Manage bills & sales
- 🤖 Predict restocking needs
- 📱 Communicate via WhatsApp/Voice
- 📊 Make data-driven decisions

**Tagline:** *"Smart Stock, Simple Shop."*

### Why Stock Line?

- ✅ **WhatsApp-First:** Alerts and reports on WhatsApp
- ✅ **Camera-Based:** Scan shelves with phone camera
- ✅ **AI-Powered:** Demand forecasting with weather & events
- ✅ **Affordable:** ₹499-1,499/month (vs ₹2,000-5,000 competitors)
- ✅ **Mobile-First:** Works on cheap smartphones
- ✅ **No-Code Automation:** Customize workflows without coding

---

## ✨ Features

### Core Features

- **📸 Image-Based Inventory**
  - Scan shop shelves with phone camera
  - AI identifies and counts products
  - 85%+ accuracy with Google Vision API

- **💳 Billing System**
  - Quick bill creation
  - PDF invoice generation
  - WhatsApp/Email bills to customers
  - Multiple payment methods

- **🤖 AI Forecasting**
  - 7-30 day demand predictions
  - Weather-based adjustments
  - Festival & event forecasting
  - Actionable restock recommendations

- **💬 WhatsApp Bot**
  - Stock check commands
  - Low stock alerts
  - Daily/Weekly reports
  - Voice message support

- **📊 Reports & Analytics**
  - Daily/Weekly/Monthly reports
  - Sales trends & charts
  - Top products & slow movers
  - Profit/loss estimates

- **🔔 Smart Alerts**
  - Low stock notifications
  - Expiry warnings
  - Sales milestones
  - Custom triggers

- **⚙️ Automation (n8n)**
  - Visual workflow builder
  - Pre-built templates
  - Custom workflows
  - Email, WhatsApp, SMS integration

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│  Frontend (React + Next.js)              │
│  - Web App (Desktop/Tablet)              │
│  - Mobile PWA (Offline support)          │
└─────────────┬────────────────────────────┘
              │
┌─────────────▼────────────────────────────┐
│  API Gateway (Rate Limiting + Auth)      │
└─────────────┬────────────────────────────┘
              │
      ┌───────┼──────┐
      │       │      │
┌─────▼──┐ ┌─▼───┐ ┌▼────┐
│ Core   │ │ ML  │ │ n8n │
│ API    │ │ AI  │ │Auto │
│(Node)  │ │(Py) │ │     │
└────┬───┘ └──┬──┘ └──┬──┘
     │        │       │
     └────────┼───────┘
              │
┌─────────────▼────────────────────────────┐
│  Data Layer                               │
│  - Firestore (Primary DB)                │
│  - Redis (Cache)                          │
│  - Firebase Storage (Files)               │
└───────────────────────────────────────────┘
```

### External Services
- **Google Vision API** - Product recognition
- **Google Speech-to-Text** - Voice commands
- **WhatsApp Business API** - Messaging
- **OpenWeatherMap** - Weather forecasting
- **Twilio** - SMS fallback
- **SendGrid** - Email

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **Docker** ([Download](https://www.docker.com/))
- **Firebase Account** ([Create](https://firebase.google.com/))
- **Google Cloud Account** ([Create](https://cloud.google.com/))

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/your-org/stock-line.git
cd stock-line

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# ML Service: http://localhost:8000
# n8n: http://localhost:5678
```

### Manual Setup

#### 1. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

#### 2. Backend

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

#### 3. ML Service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

#### 4. n8n (Optional)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
# Access at http://localhost:5678
```

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

### Core Documentation

| Document | Description |
|----------|-------------|
| [**Product Requirements**](docs/PRODUCT_REQUIREMENTS.md) | Complete feature specs, personas, metrics |
| [**System Architecture**](docs/architecture/SYSTEM_ARCHITECTURE.md) | Component design, tech stack, deployment |
| [**Database Schema**](docs/architecture/DATABASE_SCHEMA.md) | Collections, indexes, security rules |
| [**API Specification**](docs/api/API_SPECIFICATION.md) | All endpoints, request/response formats |
| [**Development Roadmap**](docs/planning/DEVELOPMENT_ROADMAP.md) | Timeline, sprints, milestones |
| [**n8n Workflows**](docs/planning/N8N_AUTOMATION_WORKFLOWS.md) | Automation templates, setup guide |
| [**UI/UX Specifications**](docs/design/UI_UX_SPECIFICATIONS.md) | Design system, components, flows |

### Quick Links

- 📖 [Full Project Plan](STOCK_LINE_PROJECT_PLAN.md)
- 🎨 [Design System](docs/design/UI_UX_SPECIFICATIONS.md#design-system)
- 🔌 [API Endpoints](docs/api/API_SPECIFICATION.md#api-endpoints)
- 🗃️ [Database Schema](docs/architecture/DATABASE_SCHEMA.md)
- 🤖 [n8n Templates](n8n-workflows/)
- 🚀 [Deployment Guide](docs/planning/DEVELOPMENT_ROADMAP.md#deployment-strategy)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14, React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui
- **State:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Animations:** Framer Motion

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Language:** TypeScript
- **Authentication:** Firebase Auth
- **Database:** Firestore (NoSQL)
- **Cache:** Redis
- **File Storage:** Firebase Storage
- **Queue:** Bull

### ML/AI Service
- **Language:** Python 3.11
- **Framework:** FastAPI
- **Vision:** Google Cloud Vision API
- **Speech:** Google Speech-to-Text
- **Forecasting:** ARIMA, Prophet, XGBoost
- **Data:** Pandas, NumPy

### Automation
- **Engine:** n8n (self-hosted/cloud)
- **Workflows:** 8+ pre-built templates
- **Integrations:** WhatsApp, Email, SMS, Sheets

### DevOps
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel (frontend), Railway (backend)
- **Monitoring:** Sentry, LogRocket
- **Analytics:** Mixpanel

---

## 💻 Development

### Project Structure

```
stock-line/
├── frontend/              # Next.js web app
├── backend/               # Node.js API server
├── ml-service/            # Python ML service
├── n8n-workflows/         # Automation templates
├── docs/                  # Documentation
├── docker-compose.yml     # Docker services
└── README.md
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes & Test**
   ```bash
   npm test
   npm run lint
   ```

3. **Commit with Conventional Commits**
   ```bash
   git commit -m "feat: add product image upload"
   ```

4. **Push & Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Quality

- **Linting:** ESLint (frontend/backend), Black (Python)
- **Formatting:** Prettier (JS/TS), Black (Python)
- **Type Checking:** TypeScript strict mode
- **Testing:** Jest (unit), Cypress (e2e)
- **Coverage:** Target 80%+

### Git Workflow

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

---

## 🚀 Deployment

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Development** | `dev.stockline.app` | Active development |
| **Staging** | `staging.stockline.app` | Pre-production testing |
| **Production** | `app.stockline.app` | Live system |

### Deployment Process

```
Code Push → GitHub
  ↓
Run Tests
  ↓
Build Docker Images
  ↓
Deploy to Staging
  ↓
Run E2E Tests
  ↓
Manual Approval
  ↓
Deploy to Production
  ↓
Health Checks
  ↓
Done ✅
```

### Quick Deploy Commands

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production (requires approval)
npm run deploy:production

# Rollback
npm run rollback:production
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'feat: add AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass

### Code of Conduct

Please be respectful and constructive. We're all here to build something great together!

---

## 📊 Project Status

### Current Phase

**Phase 1: Foundation & Setup** (Weeks 1-4)

- ✅ Project documentation complete
- ✅ Architecture designed
- ⏳ Development environment setup
- ⏳ Firebase configuration
- ⏳ CI/CD pipeline

### Upcoming Milestones

- **Week 5-10:** Core features development
- **Week 11-14:** AI/ML integration
- **Week 15-18:** Communication & automation
- **Week 19-21:** Testing & optimization
- **Week 22-26:** Pilot & launch

### Progress Tracking

See our [Development Roadmap](docs/planning/DEVELOPMENT_ROADMAP.md) for detailed timeline.

---

## 📞 Support & Contact

### Get Help

- 📧 Email: support@stockline.app
- 💬 WhatsApp: +91-XXXXXXXXXX
- 📖 Documentation: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/stock-line/issues)

### Community

- 💬 WhatsApp Community: [Join](https://chat.whatsapp.com/...)
- 🗣️ Telegram: [Join](https://t.me/stockline)
- 📱 Twitter: [@stocklineapp](https://twitter.com/stocklineapp)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Cloud** for Vision & Speech APIs
- **Firebase** for backend infrastructure
- **n8n** for automation platform
- **Open source community** for amazing tools

---

## 🌟 Star Us!

If you find Stock Line useful, please give us a ⭐ on GitHub!

---

**Built with ❤️ for small retailers in India**

---

**Version:** 1.0.0 (Base Version)  
**Last Updated:** October 10, 2025  
**Status:** In Development 🚧
