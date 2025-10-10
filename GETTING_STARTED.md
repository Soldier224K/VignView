# 🚀 Getting Started with Stock Line Development

**Welcome to the Stock Line project!** This guide will help you get started quickly.

---

## 📋 What's Been Done

### ✅ Complete Project Documentation (130+ pages)

All planning documentation is ready:

1. **[Product Requirements](docs/PRODUCT_REQUIREMENTS.md)** (15+ pages)
   - Feature specifications
   - User personas
   - Success metrics
   - Non-functional requirements

2. **[System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)** (23+ pages)
   - Component architecture
   - Technology stack decisions
   - API design
   - Deployment strategy

3. **[Database Schema](docs/architecture/DATABASE_SCHEMA.md)** (25+ pages)
   - Firestore collections
   - Indexes & optimization
   - Security rules
   - Sample documents

4. **[API Specification](docs/api/API_SPECIFICATION.md)** (24+ pages)
   - 50+ documented endpoints
   - Request/response formats
   - Authentication flows
   - Error handling

5. **[Development Roadmap](docs/planning/DEVELOPMENT_ROADMAP.md)** (20+ pages)
   - 6-month timeline
   - Sprint plan (13 sprints)
   - Resource allocation
   - Risk management

6. **[n8n Automation](docs/planning/N8N_AUTOMATION_WORKFLOWS.md)** (15+ pages)
   - 8+ workflow templates
   - Setup instructions
   - Best practices

7. **[UI/UX Design](docs/design/UI_UX_SPECIFICATIONS.md)** (21+ pages)
   - Design system
   - Component library
   - Screen specifications
   - User flows

### ✅ Project Configuration

All configuration files are set up:

- ✅ `package.json` (Frontend & Backend)
- ✅ `requirements.txt` (ML Service)
- ✅ `docker-compose.yml` (Multi-container setup)
- ✅ `Dockerfile` (Frontend, Backend, ML Service)
- ✅ `.env.example` (Environment template)
- ✅ `.gitignore` (Git ignore rules)
- ✅ `README.md` (Main documentation)

---

## 🎯 Your First Steps

### 1. Review Documentation (2-3 hours)

Start with these documents in order:

```
1. README.md                              (10 min)
2. STOCK_LINE_PROJECT_PLAN.md            (20 min)
3. PROJECT_SUMMARY.md                     (10 min)
4. docs/PRODUCT_REQUIREMENTS.md           (45 min)
5. docs/architecture/SYSTEM_ARCHITECTURE.md (45 min)
```

**Goal:** Understand the product vision, features, and architecture.

---

### 2. Set Up Your Development Environment (1-2 hours)

#### Prerequisites Installation

```bash
# Install Node.js 20+
# Download from: https://nodejs.org/

# Install Python 3.11+
# Download from: https://python.org/

# Install Docker
# Download from: https://docker.com/

# Verify installations
node --version  # Should be 20+
npm --version   # Should be 10+
python --version # Should be 3.11+
docker --version # Should be latest
```

#### Clone & Setup

```bash
# 1. Clone repository (if not already)
git clone <your-repo-url>
cd stock-line

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your credentials
# You'll need to obtain:
# - Firebase credentials
# - Google Cloud API keys
# - WhatsApp Business API credentials
# - Other service keys

nano .env  # or use your preferred editor
```

---

### 3. Obtain API Keys (2-3 hours)

You'll need accounts and API keys for:

#### Firebase (Required)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project "Stock Line Dev"
3. Enable:
   - Authentication (Email/Password, Google, Phone)
   - Firestore Database
   - Storage
4. Download service account key
5. Get web app config (API key, project ID, etc.)

#### Google Cloud (Required)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable APIs:
   - Cloud Vision API
   - Speech-to-Text API
4. Create API key
5. Download service account credentials

#### WhatsApp Business API (Required for full features)
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create Business App
3. Add WhatsApp product
4. Get Phone Number ID and Access Token
5. Set up webhook

#### OpenWeatherMap (Required for forecasting)
1. Sign up at [OpenWeatherMap](https://openweathermap.org/)
2. Get free API key (sufficient for development)

#### Twilio (Optional - for SMS)
1. Sign up at [Twilio](https://twilio.com/)
2. Get Account SID and Auth Token

#### SendGrid (Optional - for email)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Get API key

---

### 4. Start Development (30 minutes)

#### Option A: Docker (Recommended)

```bash
# Start all services at once
docker-compose up -d

# View logs
docker-compose logs -f

# Access services:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# ML Service: http://localhost:8000
# n8n: http://localhost:5678
# Redis: localhost:6379
# PostgreSQL: localhost:5432
```

#### Option B: Manual (For development)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

**Terminal 3 - ML Service:**
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

**Terminal 4 - n8n (Optional):**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
# Runs on http://localhost:5678
```

---

### 5. Verify Setup (15 minutes)

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test ML service health
curl http://localhost:8000/health

# Open frontend in browser
open http://localhost:3000
```

**Expected Results:**
- ✅ Backend returns `{"ok": true}`
- ✅ ML service returns `{"status": "healthy"}`
- ✅ Frontend loads (may show "Coming Soon" or setup page)

---

## 📚 Development Workflow

### Daily Development

1. **Pull latest code**
   ```bash
   git pull origin develop
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes & test**
   ```bash
   # Frontend
   cd frontend
   npm run dev
   npm test
   npm run lint
   
   # Backend
   cd backend
   npm run dev
   npm test
   npm run lint
   ```

4. **Commit & push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to GitHub
   - Create PR from your branch to `develop`
   - Request review

---

## 🎯 Sprint 1 Focus (Weeks 1-2)

### Backend Tasks
- [ ] Set up Express server structure
- [ ] Implement Firebase Auth integration
- [ ] Create user registration/login endpoints
- [ ] Set up Firestore connection
- [ ] Implement shop CRUD operations
- [ ] Add basic error handling
- [ ] Set up logging (Winston)

### Frontend Tasks
- [ ] Set up Next.js project structure
- [ ] Create design system (Tailwind config)
- [ ] Implement authentication pages
- [ ] Create dashboard layout
- [ ] Build navigation components
- [ ] Set up React Query
- [ ] Create Zustand stores

### DevOps Tasks
- [ ] Set up GitHub Actions CI/CD
- [ ] Configure Firebase projects (dev/staging/prod)
- [ ] Set up error tracking (Sentry)
- [ ] Configure environment variables
- [ ] Set up staging deployment

---

## 📖 Key Documentation to Bookmark

| Document | When to Use |
|----------|-------------|
| [API Spec](docs/api/API_SPECIFICATION.md) | When implementing APIs |
| [Database Schema](docs/architecture/DATABASE_SCHEMA.md) | When working with data |
| [UI/UX Design](docs/design/UI_UX_SPECIFICATIONS.md) | When building UI |
| [Roadmap](docs/planning/DEVELOPMENT_ROADMAP.md) | For sprint planning |

---

## 🆘 Common Issues & Solutions

### Issue: Firebase connection error
**Solution:** 
- Check if `.env` has correct Firebase credentials
- Verify service account key path
- Ensure Firebase project is created

### Issue: Docker containers won't start
**Solution:**
```bash
# Check Docker is running
docker ps

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Port already in use
**Solution:**
```bash
# Find process using port
lsof -i :3000  # or :5000, :8000

# Kill process
kill -9 <PID>
```

### Issue: npm install fails
**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🎓 Learning Resources

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Tutorial](https://nextjs.org/learn)

### Firestore
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TypeScript for React](https://react-typescript-cheatsheet.netlify.app/)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Components](https://tailwindui.com/)

---

## 📞 Getting Help

### Internal Resources
- **Tech Lead:** For architecture questions
- **Product Manager:** For feature clarifications
- **Design Team:** For UI/UX questions

### External Resources
- **Stack Overflow:** For coding issues
- **GitHub Issues:** For bug reports
- **Documentation:** Always check docs first!

---

## ✅ Ready to Code?

Once you've completed the above steps, you're ready to start developing!

### Next Actions:
1. ✅ Read this guide
2. ✅ Set up development environment
3. ✅ Obtain API keys
4. ✅ Start services
5. ✅ Join team standup
6. ✅ Pick first task from Sprint 1
7. ✅ Start coding!

---

**Happy Coding! Let's build something amazing! 🚀**

---

**Questions?** Ask in the team channel or create a GitHub discussion.

**Document Version:** 1.0  
**Last Updated:** October 10, 2025
