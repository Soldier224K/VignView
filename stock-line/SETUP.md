# 🚀 Stock Line - Setup Instructions

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for ML service)
- Firebase project
- Twilio account (for WhatsApp)
- OpenWeatherMap API key

### 1. Clone and Setup

```bash
git clone <repository-url>
cd stock-line
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file with your credentials:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# WhatsApp Business API (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
WHATSAPP_PHONE_NUMBER=+14155238886

# OpenWeatherMap API
OPENWEATHER_API_KEY=your-openweather-api-key

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here
```

### 3. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Go to Project Settings > Service Accounts
4. Generate a new private key
5. Copy the credentials to your `.env` file

### 4. Twilio WhatsApp Setup

1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Set up WhatsApp Sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
4. Add the sandbox number to your `.env` file

### 5. OpenWeatherMap Setup

1. Sign up at https://openweathermap.org/api
2. Get your free API key
3. Add it to your `.env` file

### 6. Run the Application

#### Option A: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option B: Local Development

```bash
# Install dependencies
npm run install:all

# Start all services
npm run dev

# Or start individually:
# Backend: npm run backend:dev
# Frontend: npm run frontend:dev
# ML Service: npm run ml:dev
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 8. First Time Setup

1. Open http://localhost:3000
2. Register a new account
3. Set up your shop (name, category, location)
4. Add your first products
5. Test the WhatsApp integration

## Features Overview

### 🏪 Shop Management
- Multi-category support (Grocery, Pharmacy, Clothing, etc.)
- Location-based weather analysis
- Shop statistics and analytics

### 📦 Inventory Management
- AI-powered product detection from shelf images
- Manual product entry and updates
- Low stock alerts and notifications
- Barcode support

### 💰 Sales Management
- Quick bill generation
- Multiple payment methods
- Sales analytics and reporting
- PDF/Excel export

### 📱 WhatsApp Integration
- Low stock alerts via WhatsApp
- Voice message support
- Weekly summary reports
- Interactive bot commands

### 🌤 Smart Forecasting
- Weather-based demand prediction
- Seasonal trend analysis
- Restock recommendations
- ML-powered insights

### 📊 Reports & Analytics
- Real-time dashboard
- Sales performance metrics
- Inventory status reports
- Weather impact analysis

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Shops
- `POST /api/shops` - Create shop
- `GET /api/shops/my-shop` - Get user's shop
- `PUT /api/shops/:id` - Update shop
- `GET /api/shops/:id/stats` - Get shop statistics

### Inventory
- `POST /api/inventory` - Add inventory item
- `GET /api/inventory` - Get inventory items
- `PUT /api/inventory/:id` - Update item
- `POST /api/inventory/analyze-image` - AI image analysis

### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales` - Get sales history
- `GET /api/sales/stats/summary` - Get sales statistics

### Reports
- `POST /api/reports/stock` - Generate stock report
- `POST /api/reports/sales` - Generate sales report
- `POST /api/reports/forecast` - Generate forecast report

### WhatsApp
- `POST /api/whatsapp/send` - Send message
- `POST /api/whatsapp/send-low-stock-alert` - Send low stock alert
- `POST /api/whatsapp/webhook` - Handle incoming messages

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check your Firebase credentials
   - Ensure Firestore is enabled
   - Verify service account permissions

2. **WhatsApp Not Working**
   - Verify Twilio credentials
   - Check WhatsApp sandbox setup
   - Ensure webhook URL is configured

3. **ML Service Errors**
   - Check Python dependencies
   - Verify OpenWeatherMap API key
   - Check service logs: `docker-compose logs ml-service`

4. **Image Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure proper image format

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ml-service

# Check service health
curl http://localhost:5000/api/health
curl http://localhost:8000/health
```

## Production Deployment

### Environment Setup
1. Use production Firebase project
2. Set up proper SSL certificates
3. Configure production domain
4. Set up monitoring and logging

### Scaling Considerations
- Use managed databases (Cloud Firestore)
- Implement Redis for caching
- Set up load balancing
- Monitor resource usage

### Security
- Use environment variables for secrets
- Implement rate limiting
- Set up proper CORS policies
- Regular security updates

## Support

For issues and questions:
- Check the logs first
- Review the API documentation
- Test individual services
- Check environment configuration

## License

MIT License - see LICENSE file for details.