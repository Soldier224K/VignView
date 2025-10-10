# Stock Line - System Architecture Document

**Version:** 1.0  
**Date:** October 10, 2025  
**Status:** Design Phase

---

## 1. Architecture Overview

Stock Line follows a **microservices-oriented architecture** with clear separation between frontend, backend APIs, AI/ML services, and automation workflows.

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Web App (React)  │  Mobile PWA  │  WhatsApp Bot  │  Voice API  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   API Gateway     │
                    │  (Rate Limiting,  │
                    │  Auth, Routing)   │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼─────┐      ┌───────▼────────┐     ┌─────▼──────┐
   │  Core    │      │   AI/ML        │     │ Automation │
   │  API     │      │   Service      │     │ Engine     │
   │ (Node.js)│      │  (Python)      │     │  (n8n)     │
   └────┬─────┘      └───────┬────────┘     └─────┬──────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │     DATA LAYER              │
              ├─────────────┬───────────────┤
              │  Firestore  │  Redis Cache  │
              │  (Primary)  │  (Sessions)   │
              └─────────────┴───────────────┘
                             │
              ┌──────────────▼──────────────┐
              │  EXTERNAL SERVICES          │
              ├─────────────────────────────┤
              │ Google Vision │ WhatsApp API│
              │ Weather API   │ SMS/Email   │
              └─────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend Layer

#### Web Application (React + Next.js)
**Technology Stack:**
- React 18.2+
- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion
- React Query (data fetching)
- Zustand (state management)

**Key Components:**
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── inventory/
│   │   ├── billing/
│   │   ├── reports/
│   │   └── settings/
│   └── layout.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── inventory/
│   │   ├── ImageUpload.tsx
│   │   ├── ProductList.tsx
│   │   └── StockAdjustment.tsx
│   ├── billing/
│   │   ├── BillForm.tsx
│   │   └── BillPreview.tsx
│   └── reports/
│       ├── SalesChart.tsx
│       └── ForecastCard.tsx
├── hooks/
│   ├── useInventory.ts
│   ├── useAuth.ts
│   └── useForecast.ts
├── lib/
│   ├── api.ts
│   ├── firebase.ts
│   └── utils.ts
└── types/
    └── index.ts
```

**Design Patterns:**
- Component composition
- Custom hooks for business logic
- Server components for static content
- Client components for interactivity
- Optimistic UI updates
- Progressive enhancement

---

#### Mobile PWA
**Features:**
- Offline-first architecture
- Service worker for caching
- Push notifications
- Camera access for image capture
- IndexedDB for local storage

**Progressive Web App Manifest:**
```json
{
  "name": "Stock Line",
  "short_name": "StockLine",
  "theme_color": "#4F46E5",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [...]
}
```

---

### 2.2 Backend Layer

#### Core API Service (Node.js + Express)

**Directory Structure:**
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── firebase.js
│   │   └── redis.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── inventory.routes.js
│   │   ├── billing.routes.js
│   │   ├── reports.routes.js
│   │   └── alerts.routes.js
│   ├── controllers/
│   │   ├── inventoryController.js
│   │   ├── billingController.js
│   │   └── reportsController.js
│   ├── services/
│   │   ├── inventoryService.js
│   │   ├── forecastService.js
│   │   ├── whatsappService.js
│   │   └── pdfService.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Shop.js
│   │   ├── Product.js
│   │   └── Sale.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   └── index.js
├── tests/
├── package.json
└── Dockerfile
```

**Key Services:**

1. **Inventory Service**
   - CRUD operations for products
   - Stock level calculations
   - Threshold monitoring
   - Movement tracking

2. **Billing Service**
   - Bill creation
   - PDF generation
   - Payment processing
   - Invoice numbering

3. **Report Service**
   - Data aggregation
   - Chart data preparation
   - Scheduled report generation
   - Export functionality

4. **Alert Service**
   - Threshold monitoring
   - Notification triggering
   - Alert history
   - Delivery status tracking

5. **WhatsApp Service**
   - Message sending
   - Interactive button handling
   - Media upload
   - Template management

---

#### AI/ML Service (Python + FastAPI)

**Directory Structure:**
```
ml-service/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── image_recognition.py
│   │   │   ├── forecasting.py
│   │   │   └── voice_processing.py
│   │   └── deps.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── models/
│   │   ├── product_detector.py
│   │   ├── demand_forecaster.py
│   │   └── anomaly_detector.py
│   ├── services/
│   │   ├── vision_service.py
│   │   ├── speech_service.py
│   │   └── prediction_service.py
│   ├── utils/
│   │   ├── image_processing.py
│   │   └── data_preprocessing.py
│   └── main.py
├── requirements.txt
└── Dockerfile
```

**ML Models:**

1. **Product Detection Model**
   - Base: Google Vision API / Custom TensorFlow model
   - Input: Shop shelf images
   - Output: Product list with confidence scores
   - Training: Transfer learning on retail images

2. **Demand Forecasting Model**
   - Algorithm: ARIMA + Prophet + XGBoost ensemble
   - Features: Historical sales, weather, events, day-of-week
   - Output: 7-30 day demand predictions
   - Retraining: Weekly on new data

3. **Anomaly Detection Model**
   - Algorithm: Isolation Forest
   - Purpose: Detect unusual sales patterns
   - Output: Anomaly alerts with reasoning

**Model Pipeline:**
```python
# Simplified forecasting pipeline
def predict_demand(shop_id, product_id, days_ahead):
    # 1. Fetch historical data
    sales_data = fetch_sales_history(shop_id, product_id)
    
    # 2. Fetch external factors
    weather = get_weather_forecast(shop_location, days_ahead)
    events = get_upcoming_events(shop_location, days_ahead)
    
    # 3. Feature engineering
    features = create_features(sales_data, weather, events)
    
    # 4. Model prediction
    prediction = ensemble_model.predict(features)
    
    # 5. Post-processing
    return {
        'predicted_demand': prediction,
        'confidence': calculate_confidence(prediction),
        'reasoning': generate_reasoning(features),
        'recommendations': generate_recommendations(prediction)
    }
```

---

### 2.3 Automation Layer (n8n)

**Workflow Architecture:**

```
Trigger → Filter → Transform → Action → Log
```

**Pre-built Workflows:**

#### 1. Low Stock Alert Workflow
```yaml
Trigger: 
  - Type: Webhook (from Core API)
  - Event: inventory.low_stock
  
Steps:
  1. Filter: Check if alert not sent in last 24h
  2. Fetch: Get product details and shop owner contact
  3. Transform: Create WhatsApp message with template
  4. Action: Send WhatsApp message
  5. Log: Record alert in database
  6. If urgent: Send SMS as well
```

#### 2. Daily Report Workflow
```yaml
Trigger:
  - Type: Schedule (Cron: 0 8 * * *)
  - Time: 8 AM daily
  
Steps:
  1. Fetch: Get all active shops
  2. For each shop:
     a. Fetch yesterday's sales data
     b. Fetch current stock levels
     c. Generate summary
     d. Create PDF report
  3. Action: Send WhatsApp message with PDF
  4. Backup: Email to owner
  5. Log: Mark report sent
```

#### 3. Restock Order Workflow
```yaml
Trigger:
  - Type: Webhook
  - Event: user.restock_confirmed (via WhatsApp reply)
  
Steps:
  1. Parse: Extract product and quantity
  2. Check: Verify supplier details
  3. Create: Generate purchase order
  4. Action: 
     a. Add to Google Sheets
     b. Email to supplier
     c. WhatsApp to owner (confirmation)
  5. Update: Mark restock as "ordered"
```

---

### 2.4 Data Layer

#### Primary Database (Firestore)

**Collection Structure:**

```javascript
// Collections
users/
  {userId}/
    - profile: {...}
    - shops: [shopIds]
    - preferences: {...}

shops/
  {shopId}/
    - details: {...}
    - inventory/
      {productId}/
        - details: {...}
        - movements: [subcollection]
    - sales/
      {saleId}/
        - billData: {...}
    - reports/
      {reportId}/
        - data: {...}

alerts/
  {alertId}/
    - shopId: ref
    - productId: ref
    - type: string
    - status: string
    - createdAt: timestamp

forecasts/
  {forecastId}/
    - shopId: ref
    - predictions: {...}
    - generatedAt: timestamp
```

**Firestore Indexes:**
```javascript
// Composite indexes
shops/{shopId}/inventory - (category, updatedAt)
shops/{shopId}/sales - (createdAt, totalAmount)
alerts - (shopId, status, createdAt)
```

**Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Shop access based on ownership
    match /shops/{shopId} {
      allow read: if request.auth.uid in resource.data.ownerIds;
      allow write: if request.auth.uid in resource.data.ownerIds;
      
      // Nested inventory
      match /inventory/{productId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/shops/$(shopId)).data.ownerIds;
      }
    }
  }
}
```

---

#### Cache Layer (Redis)

**Usage:**
1. **Session Storage** - User sessions (TTL: 7 days)
2. **API Response Cache** - Frequently accessed data (TTL: 5 minutes)
3. **Rate Limiting** - API call counting
4. **Real-time Analytics** - Temporary aggregations

**Redis Key Patterns:**
```
session:{userId}         - User session data
cache:shop:{shopId}      - Shop details
cache:inventory:{shopId} - Product list
ratelimit:{userId}:{endpoint} - API rate limiting
analytics:daily:{shopId} - Daily metrics
```

---

### 2.5 External Services Integration

#### Google Vision API
**Purpose:** Product recognition from images
**Endpoint:** `https://vision.googleapis.com/v1/images:annotate`
**Features Used:**
- LABEL_DETECTION
- OBJECT_LOCALIZATION
- TEXT_DETECTION (for price tags)
- LOGO_DETECTION (brand identification)

**Rate Limits:** 1,000 requests/month (free tier)

---

#### WhatsApp Business Cloud API
**Provider:** Meta / Twilio
**Capabilities:**
- Text messages
- Template messages
- Interactive buttons
- Media sharing (images, PDFs)
- Read receipts

**Message Flow:**
```
User → WhatsApp → Webhook → Core API → Process → Response → WhatsApp → User
```

**Webhook Handler:**
```javascript
app.post('/webhooks/whatsapp', async (req, res) => {
  const { from, message } = req.body;
  
  // Acknowledge immediately
  res.sendStatus(200);
  
  // Process asynchronously
  processWhatsAppMessage(from, message);
});

async function processWhatsAppMessage(from, message) {
  // 1. Identify user and shop
  const user = await getUserByWhatsApp(from);
  
  // 2. Parse intent
  const intent = await parseIntent(message.text);
  
  // 3. Execute action
  const response = await handleIntent(intent, user);
  
  // 4. Send response
  await sendWhatsAppMessage(from, response);
}
```

---

#### OpenWeatherMap API
**Purpose:** Weather forecasting for demand prediction
**Endpoint:** `https://api.openweathermap.org/data/2.5/forecast`
**Data Used:**
- Temperature
- Precipitation
- Humidity
- Wind speed

**Integration:**
```javascript
async function getWeatherImpact(shopLocation, productCategory) {
  const forecast = await fetchWeatherForecast(shopLocation);
  
  const impactRules = {
    'cold_drinks': { 
      temp_above: 30, 
      multiplier: 1.5 
    },
    'umbrellas': { 
      rain_probability: 70, 
      multiplier: 2.0 
    },
    // ... more rules
  };
  
  return calculateImpact(forecast, impactRules[productCategory]);
}
```

---

## 3. API Design

### 3.1 REST API Endpoints

**Base URL:** `https://api.stockline.app/v1`

#### Authentication
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
GET    /auth/verify
```

#### Shop Management
```
POST   /shops
GET    /shops/:shopId
PUT    /shops/:shopId
DELETE /shops/:shopId
GET    /shops/:shopId/stats
```

#### Inventory
```
POST   /shops/:shopId/inventory
GET    /shops/:shopId/inventory
GET    /shops/:shopId/inventory/:productId
PUT    /shops/:shopId/inventory/:productId
DELETE /shops/:shopId/inventory/:productId
POST   /shops/:shopId/inventory/bulk-upload
POST   /shops/:shopId/inventory/image-scan
```

#### Billing
```
POST   /shops/:shopId/bills
GET    /shops/:shopId/bills
GET    /shops/:shopId/bills/:billId
GET    /shops/:shopId/bills/:billId/pdf
DELETE /shops/:shopId/bills/:billId
```

#### Reports
```
GET    /shops/:shopId/reports/daily?date=YYYY-MM-DD
GET    /shops/:shopId/reports/weekly?week=W&year=YYYY
GET    /shops/:shopId/reports/monthly?month=MM&year=YYYY
POST   /shops/:shopId/reports/custom
GET    /shops/:shopId/reports/:reportId/export
```

#### Forecasting
```
GET    /shops/:shopId/forecasts
POST   /shops/:shopId/forecasts/generate
GET    /shops/:shopId/forecasts/:productId
```

#### Alerts
```
GET    /shops/:shopId/alerts
PUT    /shops/:shopId/alerts/:alertId/mark-read
DELETE /shops/:shopId/alerts/:alertId
POST   /shops/:shopId/alerts/settings
```

---

### 3.2 API Request/Response Examples

#### Example 1: Create Product
**Request:**
```http
POST /shops/shop_123/inventory
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Maggi Noodles 100g",
  "category": "grocery",
  "barcode": "8901234567890",
  "current_quantity": 50,
  "unit": "pieces",
  "low_stock_threshold": 20,
  "reorder_point": 30,
  "cost_price": 12.50,
  "selling_price": 15.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product_id": "prod_xyz789",
    "name": "Maggi Noodles 100g",
    "created_at": "2025-10-10T10:30:00Z"
  }
}
```

---

#### Example 2: Image-Based Stock Scan
**Request:**
```http
POST /shops/shop_123/inventory/image-scan
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [binary image data]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scan_id": "scan_abc123",
    "detected_products": [
      {
        "name": "Coca Cola 500ml",
        "confidence": 0.95,
        "estimated_quantity": 12,
        "requires_review": false
      },
      {
        "name": "Pepsi 500ml",
        "confidence": 0.88,
        "estimated_quantity": 8,
        "requires_review": false
      },
      {
        "name": "Unknown Bottle",
        "confidence": 0.45,
        "estimated_quantity": 3,
        "requires_review": true
      }
    ],
    "processing_time_ms": 2350
  }
}
```

---

#### Example 3: Generate Forecast
**Request:**
```http
POST /shops/shop_123/forecasts/generate
Content-Type: application/json
Authorization: Bearer {token}

{
  "product_ids": ["prod_xyz789", "prod_abc456"],
  "forecast_days": 7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "forecast_id": "forecast_123",
    "generated_at": "2025-10-10T10:30:00Z",
    "predictions": [
      {
        "product_id": "prod_xyz789",
        "product_name": "Maggi Noodles 100g",
        "daily_predictions": [
          {
            "date": "2025-10-11",
            "predicted_demand": 15,
            "confidence": 0.82,
            "factors": {
              "historical_avg": 12,
              "weather_impact": 1.1,
              "event_impact": 1.2
            }
          }
          // ... more days
        ],
        "recommendation": "Restock 100 units by Oct 15",
        "reasoning": "Upcoming festival + favorable weather"
      }
    ]
  }
}
```

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
User Login → Firebase Auth → JWT Token → Store in Cookie/LocalStorage
↓
Every API Request → Verify JWT → Extract User ID → Check Permissions → Proceed
```

**JWT Payload:**
```json
{
  "uid": "user_123",
  "email": "rajesh@shop.com",
  "role": "owner",
  "shops": ["shop_123", "shop_456"],
  "iat": 1696934400,
  "exp": 1697020800
}
```

---

### 4.2 Authorization Levels

| Role | Permissions |
|------|-------------|
| **Owner** | Full access to shop data, settings, billing |
| **Manager** | Inventory management, billing, reports (read-only settings) |
| **Staff** | Create bills, view inventory (no edit/delete) |

---

### 4.3 Data Encryption

- **At Rest:** AES-256 encryption (Firebase default)
- **In Transit:** TLS 1.3
- **Sensitive Fields:** Additional encryption for financial data
- **API Keys:** Stored in environment variables, rotated monthly

---

### 4.4 Rate Limiting

```javascript
// Rate limit configuration
const rateLimits = {
  '/api/auth/*': { windowMs: 15 * 60 * 1000, max: 5 },  // 5 per 15min
  '/api/*/image-scan': { windowMs: 60 * 1000, max: 10 }, // 10 per min
  '/api/*': { windowMs: 60 * 1000, max: 100 }            // 100 per min
};
```

---

## 5. Scalability & Performance

### 5.1 Horizontal Scaling
- **API Servers:** Load balancer + multiple Node.js instances
- **ML Service:** Separate instances with GPU support
- **Database:** Firestore auto-scales
- **Cache:** Redis cluster mode

### 5.2 Performance Optimizations
- **CDN:** Static assets served via Cloudflare/Vercel Edge
- **Image Optimization:** WebP format, lazy loading
- **Database Queries:** Indexed fields, pagination
- **Caching Strategy:** 
  - Hot data (1-5 min)
  - Warm data (5-30 min)
  - Cold data (fetch from DB)

### 5.3 Load Estimates (1000 shops)
- **Daily API Requests:** ~500,000
- **Image Scans:** ~3,000/day
- **WhatsApp Messages:** ~10,000/day
- **Database Reads:** ~2M/day
- **Database Writes:** ~200K/day

---

## 6. Monitoring & Observability

### 6.1 Logging
- **Application Logs:** Winston (Node.js), Python logging
- **Access Logs:** Nginx/Cloud Load Balancer
- **Error Logs:** Sentry
- **Audit Logs:** All create/update/delete operations

### 6.2 Metrics
- **System Metrics:** CPU, Memory, Disk, Network
- **Application Metrics:** Request rate, latency, error rate
- **Business Metrics:** Active users, bills created, alerts sent

### 6.3 Alerts
- API error rate > 1%
- Response time p95 > 1 second
- Database connection pool exhausted
- ML model accuracy < 80%
- Critical service down

---

## 7. Disaster Recovery

### 7.1 Backup Strategy
- **Database:** Daily automated backups (retained 30 days)
- **Files:** Replicated across 3 regions
- **Code:** Git repository with tags for each release

### 7.2 Recovery Procedures
- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 24 hours
- **Failover:** Automatic DNS failover to backup region

---

## 8. Deployment Architecture

### 8.1 Environments

| Environment | Purpose | Infrastructure |
|-------------|---------|----------------|
| **Development** | Active development | Local Docker Compose |
| **Staging** | Pre-production testing | Railway/Render |
| **Production** | Live system | Vercel + Railway/GCP |

### 8.2 CI/CD Pipeline

```
Code Push → GitHub Actions
  ↓
Run Tests (Unit + Integration)
  ↓
Build Docker Images
  ↓
Push to Container Registry
  ↓
Deploy to Staging
  ↓
Run E2E Tests
  ↓
Manual Approval
  ↓
Deploy to Production (Blue-Green)
  ↓
Health Check
  ↓
Switch Traffic
```

---

## 9. Technology Decisions & Rationale

| Choice | Rationale |
|--------|-----------|
| **Next.js** | SSR for SEO, API routes, great DX |
| **Firestore** | Real-time sync, offline support, scales automatically |
| **FastAPI** | High performance Python for ML, async support |
| **n8n** | Visual workflows, self-hostable, extensible |
| **Redis** | Fast caching, pub/sub for real-time features |
| **Google Vision** | Best accuracy for product detection, free tier available |

---

## 10. Appendix

### 10.1 System Requirements

**Minimum Server Specs (100 shops):**
- CPU: 2 vCPUs
- RAM: 4GB
- Storage: 50GB SSD
- Bandwidth: 1TB/month

**Recommended Server Specs (1000 shops):**
- CPU: 4 vCPUs
- RAM: 8GB
- Storage: 200GB SSD
- Bandwidth: 5TB/month

---

### 10.2 Third-Party Service Costs (Monthly)

| Service | Cost (1000 shops) |
|---------|-------------------|
| Firebase (Firestore + Storage) | $500 |
| Google Vision API | $300 |
| WhatsApp Business API | $400 |
| Vercel Pro | $20 |
| Railway | $100 |
| SendGrid | $15 |
| Sentry | $26 |
| **Total** | **~$1,361/month** |

---

**Document Owner:** Technical Architect, Stock Line  
**Last Updated:** 2025-10-10  
**Next Review:** 2025-11-10
