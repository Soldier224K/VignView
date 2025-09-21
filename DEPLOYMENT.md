# VighnView Deployment Guide

This guide covers deploying VighnView to production environments.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN/Static    │    │   Monitoring    │
│   (Nginx/ALB)   │    │   (CloudFront)  │    │   (Grafana)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      Application Layer    │
                    │   (Docker Containers)     │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    Data & Storage Layer   │
                    │  (PostgreSQL + Redis)     │
                    └───────────────────────────┘
```

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for Small-Medium Scale)

#### Prerequisites
- Docker and Docker Compose installed
- Domain name configured
- SSL certificate (Let's Encrypt recommended)

#### Steps

1. **Clone and Setup**
```bash
git clone https://github.com/your-org/vighnview.git
cd vighnview
cp .env.example .env
# Edit .env with production values
```

2. **Configure Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://username:password@postgres:5432/vighnview
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=vighnview-prod-uploads

# Production Settings
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
```

3. **Deploy with Docker Compose**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Kubernetes (Recommended for Large Scale)

#### Prerequisites
- Kubernetes cluster (EKS, GKE, AKS)
- kubectl configured
- Helm installed

#### Steps

1. **Create Namespace**
```bash
kubectl create namespace vighnview
```

2. **Deploy with Helm**
```bash
helm install vighnview ./helm-chart \
  --namespace vighnview \
  --set image.tag=latest \
  --set ingress.host=your-domain.com
```

### Option 3: Cloud Platform (AWS/GCP/Azure)

#### AWS Deployment

1. **Using AWS App Runner**
```bash
# Create apprunner.yaml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - npm install
      - npm run build
run:
  runtime-version: 18
  command: npm start
  network:
    port: 3000
  env:
    - name: NODE_ENV
      value: production
```

2. **Using AWS ECS with Fargate**
```bash
# Create task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

#### Google Cloud Platform

1. **Using Cloud Run**
```bash
gcloud run deploy vighnview-backend \
  --source ./backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

2. **Using App Engine**
```bash
gcloud app deploy ./app.yaml
```

## 🗄️ Database Setup

### PostgreSQL Production Setup

1. **Create Production Database**
```sql
CREATE DATABASE vighnview_prod;
CREATE USER vighnview_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE vighnview_prod TO vighnview_user;
```

2. **Run Migrations**
```bash
cd backend
npm run migrate
```

3. **Seed Initial Data**
```bash
npm run seed
```

### Redis Production Setup

1. **Configure Redis**
```bash
# redis.conf
bind 0.0.0.0
port 6379
requirepass your_redis_password
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Using Let's Encrypt with Certbot**
```bash
certbot --nginx -d your-domain.com
```

2. **Using Cloudflare**
- Add your domain to Cloudflare
- Enable SSL/TLS encryption
- Configure security headers

### Security Headers

```nginx
# nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### Environment Security

```bash
# Use secrets management
export JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id vighnview/jwt-secret --query SecretString --output text)
export DATABASE_URL=$(aws secretsmanager get-secret-value --secret-id vighnview/database-url --query SecretString --output text)
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **Using Prometheus + Grafana**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'vighnview-backend'
    static_configs:
      - targets: ['backend:3000']
```

2. **Using DataDog**
```bash
# Install DataDog agent
DD_API_KEY=your-api-key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

### Log Management

1. **Using ELK Stack**
```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"
  
  logstash:
    image: logstash:7.14.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  
  kibana:
    image: kibana:7.14.0
    ports:
      - "5601:5601"
```

2. **Using CloudWatch (AWS)**
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to AWS
        run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker build -t $ECR_REGISTRY/vighnview:$GITHUB_SHA .
          docker push $ECR_REGISTRY/vighnview:$GITHUB_SHA
```

### GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm install
    - npm test

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - kubectl set image deployment/vighnview vighnview=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

## 📈 Performance Optimization

### Backend Optimization

1. **Enable Compression**
```javascript
// app.js
const compression = require('compression');
app.use(compression());
```

2. **Database Connection Pooling**
```javascript
// database.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

3. **Redis Caching**
```javascript
// cache.js
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});
```

### Frontend Optimization

1. **Code Splitting**
```javascript
// App.js
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

2. **Service Worker for Caching**
```javascript
// sw.js
const CACHE_NAME = 'vighnview-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## 🔧 Maintenance

### Database Maintenance

1. **Regular Backups**
```bash
#!/bin/bash
# backup.sh
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
aws s3 cp backup_*.sql s3://vighnview-backups/
```

2. **Database Optimization**
```sql
-- Analyze tables for better query planning
ANALYZE;

-- Reindex for better performance
REINDEX DATABASE vighnview_prod;
```

### Application Updates

1. **Zero-Downtime Deployment**
```bash
# Rolling update with Docker Swarm
docker service update --image vighnview:latest vighnview_backend
```

2. **Health Checks**
```bash
# Health check endpoint
curl -f http://localhost:3000/health || exit 1
```

## 📞 Support & Troubleshooting

### Common Issues

1. **Database Connection Issues**
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"
```

2. **Memory Issues**
```bash
# Monitor memory usage
docker stats
```

3. **Performance Issues**
```bash
# Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Log Analysis

```bash
# View application logs
docker logs vighnview_backend --tail 100 -f

# Search for errors
grep -i error /var/log/vighnview/app.log
```

## 📋 Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Security headers configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Health checks configured
- [ ] Load balancer configured
- [ ] CDN setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Log aggregation working
- [ ] CI/CD pipeline tested
- [ ] Disaster recovery plan ready

---

For more detailed information, refer to the individual component documentation in each directory.