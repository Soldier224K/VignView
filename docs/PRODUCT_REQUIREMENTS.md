# Stock Line - Product Requirements Document (PRD)

**Version:** 1.0 (Base Version)  
**Date:** October 10, 2025  
**Status:** Planning Phase  
**Tagline:** *"Smart Stock, Simple Shop."*

---

## Executive Summary

Stock Line is an AI-assisted retail management system designed for small to medium retail shops (grocery, pharmacy, clothing, stationery, hardware, etc.). The system provides enterprise-grade stock intelligence through simple interfaces including camera uploads, WhatsApp messaging, voice commands, and text inputs.

**Target Market:** Small to medium retail businesses in India (100-10,000 sq ft)  
**Price Point:** ₹500-1,500/month per shop  
**Launch Timeline:** 6 months (3 phases)

---

## 1. Vision & Objectives

### Vision
Provide small retailers with **enterprise-grade stock intelligence** without requiring expensive hardware or technical skills.

### Primary Objectives
1. **Reduce stockouts** by 60% through predictive alerts
2. **Minimize overstocking** by 40% through AI forecasting
3. **Save time** - 2+ hours/day on manual stock checking
4. **Increase profitability** by 15-25% through optimized inventory

### Success Metrics
- **User Adoption:** 500+ shops in first 6 months
- **Retention Rate:** >80% monthly
- **Time to Value:** <24 hours from signup to first alert
- **Accuracy:** >85% product recognition from images
- **Response Time:** <3 seconds for WhatsApp alerts

---

## 2. Target Users

### Primary Personas

#### 1. **Rajesh - Grocery Store Owner**
- Age: 35-50
- Tech Comfort: Low-Medium
- Pain Points: Manual stock counting, unexpected stockouts, wastage
- Needs: Simple interface, WhatsApp alerts, automatic reordering

#### 2. **Priya - Pharmacy Manager**
- Age: 28-40
- Tech Comfort: Medium
- Pain Points: Medicine expiry tracking, critical stock alerts
- Needs: Accurate inventory, compliance reports, supplier integration

#### 3. **Amit - Clothing Boutique Owner**
- Age: 25-35
- Tech Comfort: Medium-High
- Pain Points: Seasonal inventory planning, size/variant tracking
- Needs: Visual inventory, trend analysis, festival predictions

---

## 3. Core Features (Base Version)

### 3.1 Shop Setup & Onboarding
**Priority:** P0 (Must Have)

**Features:**
- Simple registration (Google/WhatsApp login)
- Shop profile creation
  - Name, Category, Location
  - Business hours, Contact details
  - Shop type selection (predefined categories)
- One-time location pinning for regional analysis
- Guided onboarding wizard (5 steps, <10 minutes)

**Acceptance Criteria:**
- User can complete setup in <10 minutes
- Location accuracy within 1km
- Support for 8+ shop categories

---

### 3.2 Stock Management
**Priority:** P0 (Must Have)

**Features:**

#### A. Image-Based Stock Entry
- Take photo of shop shelves
- AI identifies products and estimates quantities
- Manual correction/override capability
- Support for multiple images per session
- Batch processing (up to 10 images)

#### B. Manual Stock Entry
- Quick add product form
- CSV/Excel import
- Barcode scanning (mobile camera)
- Bulk edit capabilities

#### C. Stock Tracking
- Real-time inventory levels
- Product variants (size, color, flavor)
- Low stock threshold setting
- Reorder point configuration
- Stock movement history

**Technical Requirements:**
- Image recognition accuracy >85%
- Support for 10,000+ products per shop
- Image processing time <5 seconds
- Offline data capture with sync

**Acceptance Criteria:**
- 85% accuracy in product recognition
- Support for poor quality images (low-end phones)
- Manual override saves within 2 seconds
- Sync completes within 30 seconds on 3G

---

### 3.3 WhatsApp/Voice/Text Interface
**Priority:** P0 (Must Have)

**Features:**

#### WhatsApp Bot
- Daily stock summary (morning)
- Low stock alerts (real-time)
- Weekly reports (Sunday evening)
- Interactive commands:
  - "Check [product name]"
  - "Restock [product]"
  - "Today's sales"
  - "Help"
- Quick replies (button-based)

#### Voice Interface
- Voice message processing
- Speech-to-text for queries
- Text-to-speech for responses
- Support for Hindi, English, Hinglish

#### SMS Fallback
- Critical alerts via SMS
- Network failure backup

**Technical Requirements:**
- WhatsApp Business API integration
- Speech recognition accuracy >90%
- Response time <3 seconds
- Multi-language support

**Acceptance Criteria:**
- 95% message delivery rate
- Voice recognition works with background noise
- Support for 5+ Indian languages
- Fallback to SMS if WhatsApp fails

---

### 3.4 Billing & Reports
**Priority:** P0 (Must Have)

**Features:**

#### Billing System
- Quick bill creation (mobile/web)
- Product search (name/barcode)
- Price calculation with taxes
- Multiple payment methods
- Print/Share PDF bills
- Excel export for accounting

#### Automated Reports
- Daily sales summary
- Weekly stock movement
- Monthly performance analytics
- Profit/loss estimation
- Comparison reports (MoM, YoY)

#### Predictive Analytics
- Restock recommendations
- Sales forecasting (7-30 days)
- Seasonal trend analysis
- Slow-moving item alerts

**Technical Requirements:**
- PDF generation <2 seconds
- Excel export supports 10,000+ rows
- Reports accessible for 2 years
- Real-time data refresh

**Acceptance Criteria:**
- Bills generate within 2 seconds
- Reports load within 5 seconds
- Data accuracy >99%
- Export works on 2G networks

---

### 3.5 Smart Forecasting
**Priority:** P1 (Should Have)

**Features:**

#### Weather-Based Predictions
- Integration with OpenWeatherMap API
- Automatic inventory adjustments:
  - Summer: Cold drinks, ice cream, ACs
  - Monsoon: Umbrellas, raincoats
  - Winter: Warm clothes, heaters
- 7-day weather forecast display

#### Event-Based Forecasting
- Festival calendar integration (Diwali, Eid, Holi, Christmas)
- Regional event tracking
- School calendar (exam season, vacations)
- Sports events (IPL, World Cup)

#### AI-Powered Predictions
- Historical sales analysis
- Trend detection (weekly/monthly)
- Anomaly detection
- Demand forecasting using:
  - Past sales data
  - Weather patterns
  - Regional events
  - Day of week patterns

**Technical Requirements:**
- ML model accuracy >75%
- Prediction horizon: 7-30 days
- Model retraining: weekly
- Real-time weather data

**Acceptance Criteria:**
- 75% forecast accuracy for top 100 products
- Weather data updates every 6 hours
- Festival alerts 2 weeks in advance
- Recommendations actionable (clear next steps)

---

### 3.6 Automation Layer (n8n Integration)
**Priority:** P1 (Should Have)

**Features:**

#### Workflow Automation
- Visual workflow builder
- Pre-built templates:
  - Low stock → WhatsApp alert
  - Daily report → Email
  - Restock order → Supplier notification
  - Sales threshold → Owner alert

#### Trigger Events
- Stock level drops below threshold
- Sales exceed daily target
- New product added
- Bill generated
- Report scheduled

#### Action Capabilities
- Send WhatsApp message
- Send email
- Create Google Sheets entry
- Generate PDF
- Call webhook
- Update inventory

**Technical Requirements:**
- n8n self-hosted or cloud
- Workflow execution time <10 seconds
- 99.5% uptime
- Error handling & retry logic

**Acceptance Criteria:**
- 10+ pre-built workflow templates
- Custom workflow creation <5 minutes
- Execution logs for 30 days
- Alert if workflow fails

---

## 4. Database Architecture

### Core Collections/Tables

#### Users
```
- user_id (PK)
- whatsapp_number
- email
- name
- role (owner/manager/staff)
- language_preference
- created_at
- last_login
```

#### Shops
```
- shop_id (PK)
- user_id (FK)
- shop_name
- category (enum)
- location (lat/lng)
- address
- pincode
- business_hours
- onboarding_completed (boolean)
- subscription_tier
- created_at
```

#### Inventory
```
- product_id (PK)
- shop_id (FK)
- product_name
- category
- variant (size/color/flavor)
- barcode
- current_quantity
- unit (kg/liter/pieces)
- low_stock_threshold
- reorder_point
- supplier_id
- cost_price
- selling_price
- image_url
- last_restocked
- last_updated
```

#### Sales
```
- sale_id (PK)
- shop_id (FK)
- bill_number
- items (JSONB) [{product_id, quantity, price}]
- total_amount
- payment_method
- customer_name (optional)
- customer_phone (optional)
- created_at
```

#### Stock_Movements
```
- movement_id (PK)
- product_id (FK)
- shop_id (FK)
- type (restock/sale/adjustment/return)
- quantity_change
- reason
- created_by
- created_at
```

#### Reports
```
- report_id (PK)
- shop_id (FK)
- report_type (daily/weekly/monthly)
- data (JSONB)
- generated_at
- pdf_url
```

#### Alerts
```
- alert_id (PK)
- shop_id (FK)
- product_id (FK)
- alert_type (low_stock/reorder/anomaly)
- message
- status (sent/read/actioned)
- channel (whatsapp/sms/email)
- created_at
```

#### Forecasts
```
- forecast_id (PK)
- shop_id (FK)
- product_id (FK)
- forecast_date
- predicted_demand
- confidence_score
- factors (JSONB) {weather, events, trends}
- created_at
```

---

## 5. Technical Stack

### Frontend
- **Framework:** React.js 18+ / Next.js 14
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** React Query + Zustand
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts / Chart.js
- **Mobile:** Progressive Web App (PWA)

### Backend
- **API Server:** Node.js + Express.js
- **ML/AI Service:** Python + FastAPI
- **Authentication:** Firebase Auth / Auth0
- **File Storage:** Firebase Storage / AWS S3
- **Image Processing:** Google Vision API / AWS Rekognition
- **Speech:** Google Speech-to-Text API

### Database
- **Primary DB:** Firebase Firestore (NoSQL)
- **Backup Option:** MongoDB Atlas
- **Caching:** Redis
- **Analytics:** BigQuery / PostgreSQL

### Automation
- **Workflow Engine:** n8n (self-hosted/cloud)
- **Message Queue:** Bull (Redis-based)
- **Scheduler:** node-cron

### Communication
- **WhatsApp:** WhatsApp Business Cloud API
- **SMS:** Twilio / MSG91
- **Email:** SendGrid / AWS SES

### DevOps
- **Hosting:** Vercel (frontend) + Railway/Render (backend)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry + LogRocket
- **Analytics:** Mixpanel / PostHog

---

## 6. Non-Functional Requirements

### Performance
- Page load time: <2 seconds (3G)
- API response time: <300ms (p95)
- Image processing: <5 seconds
- Offline support: 7 days of data
- Concurrent users: 1000+ per instance

### Security
- Data encryption: AES-256 at rest
- HTTPS/TLS 1.3 for transit
- Authentication: OAuth 2.0 + JWT
- RBAC (Role-Based Access Control)
- Regular security audits
- GDPR/Data protection compliance

### Scalability
- Horizontal scaling support
- Database sharding capability
- CDN for static assets
- Auto-scaling based on load
- Support for 10,000+ shops

### Reliability
- Uptime: 99.5% (base tier)
- Automated backups: Daily
- Disaster recovery: <4 hours
- Data retention: 2 years minimum
- Graceful degradation on failures

### Accessibility
- Mobile-first responsive design
- Low bandwidth optimization
- Support for low-end devices
- Multi-language support (8+ languages)
- Voice navigation for literacy challenges

---

## 7. Compliance & Privacy

### Data Privacy
- User data ownership
- Right to export data
- Right to delete account
- Transparent data usage policy
- No data selling to third parties

### Financial Compliance
- GST calculation support
- Invoice numbering standards
- Tax report generation
- Audit trail maintenance

### Industry Standards
- ISO 27001 (Security)
- SOC 2 Type II (if scaling to enterprise)
- PCI DSS (if handling payments directly)

---

## 8. Pricing Model

### Tier 1: Starter (₹499/month)
- Single shop
- Up to 500 products
- 1000 bills/month
- Basic reports
- WhatsApp alerts
- Email support

### Tier 2: Professional (₹999/month)
- Single shop
- Up to 2000 products
- Unlimited bills
- Advanced analytics
- Voice interface
- Priority support
- n8n automation (5 workflows)

### Tier 3: Business (₹1,499/month)
- Multi-shop (up to 3)
- Unlimited products
- Unlimited bills
- AI forecasting
- Custom workflows
- Supplier integration
- Dedicated support

### Add-ons
- Additional shops: ₹300/month each
- Advanced ML models: ₹200/month
- Custom integrations: ₹500/month
- White-label: Custom pricing

---

## 9. Go-to-Market Strategy

### Phase 1: Pilot (Month 1-2)
- Onboard 20 shops (free pilot)
- Gather feedback
- Iterate on UX
- Test in real conditions

### Phase 2: Beta Launch (Month 3-4)
- Launch in 2 cities (Tier 2)
- 100 paid customers
- Content marketing
- WhatsApp community building
- Referral program

### Phase 3: Public Launch (Month 5-6)
- Pan-India availability
- 500+ shops target
- Influencer marketing
- Trade association partnerships
- SEO/SEM campaigns

---

## 10. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low image quality from cheap phones | High | High | Train on diverse image dataset, manual override |
| WhatsApp API rate limits | Medium | Medium | Implement queuing, SMS fallback |
| User adoption resistance | High | Medium | Extensive onboarding, local language support |
| Competition from established players | High | Medium | Focus on affordability + WhatsApp-first approach |
| Internet connectivity issues | High | High | Offline-first design, sync when online |
| AI prediction accuracy | Medium | Medium | Continuous model training, human oversight |
| Regulatory changes (data privacy) | Medium | Low | Legal consultation, compliance monitoring |

---

## 11. Success Criteria

### Launch Success (Month 6)
- ✅ 500+ active shops
- ✅ 80%+ retention rate
- ✅ >4.0 rating on Play Store
- ✅ <10% churn rate
- ✅ 85%+ product recognition accuracy

### Business Success (Year 1)
- ✅ 5,000+ active shops
- ✅ ₹50L+ MRR (Monthly Recurring Revenue)
- ✅ 90%+ customer satisfaction
- ✅ Break-even or profitable
- ✅ 3-5 enterprise clients

### Product Success
- ✅ <30s average response time
- ✅ 99%+ uptime
- ✅ 50%+ users use WhatsApp interface
- ✅ 40%+ shops report increased profits
- ✅ Featured in 3+ tech publications

---

## 12. Future Roadmap (Post Base Version)

### Phase 2 Features
- Supplier portal & direct ordering
- Multi-branch management
- Employee management & permissions
- Customer loyalty program
- Integration with e-commerce platforms

### Phase 3 Features
- IoT sensor integration (smart shelves)
- CCTV analytics for customer behavior
- Dynamic pricing recommendations
- Blockchain for supply chain tracking
- AR for inventory visualization

### Enterprise Features
- White-label solution
- API for third-party integrations
- Advanced BI dashboards
- Multi-country support
- ERP integration (SAP, Oracle)

---

## Appendix

### A. Glossary
- **Stockout:** When inventory of a product reaches zero
- **Reorder Point:** Inventory level that triggers restocking
- **SKU:** Stock Keeping Unit (unique product identifier)
- **Turnover Rate:** How quickly inventory is sold and replaced
- **Dead Stock:** Inventory that hasn't sold in 90+ days

### B. References
- OpenWeatherMap API Documentation
- WhatsApp Business API Guide
- Google Vision API Documentation
- n8n Workflow Documentation

### C. Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-10 | Stock Line Team | Initial PRD for Base Version |

---

**Document Owner:** Product Manager, Stock Line  
**Reviewers:** Engineering Lead, Design Lead, Business Lead  
**Next Review Date:** 2025-11-10
