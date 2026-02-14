# 🧭 STOCK LINE — BASE VERSION

**Tagline:** *"Smart Stock, Simple Shop."*

## Overview

Stock Line is an affordable, AI-assisted retail management system that helps small businesses track stock, manage bills, and predict restocking needs through simple tools like WhatsApp, voice, text, and images.

## Architecture

- **Frontend**: React.js + Tailwind CSS (Mobile-first design)
- **Backend**: Node.js + Express (API layer)
- **ML Service**: Python + FastAPI (Image recognition & forecasting)
- **Database**: Firebase Firestore
- **Automation**: n8n workflows
- **Messaging**: WhatsApp Business API
- **Weather**: OpenWeatherMap API

## Features

### 🏪 Shop Setup
- Simple registration (Shop Name, Category, Location)
- Product list via manual entry or photo scan
- Location pinning for weather-based analysis

### 🧾 Stock Management
- AI-powered product identification from shelf images
- Manual stock updates via app or WhatsApp
- CSV/Excel billing data import
- Auto-sync to cloud database

### 📱 WhatsApp Interface
- Low stock alerts via WhatsApp
- Voice message support
- Weekly stock summaries
- Restock confirmation system

### 📊 Billing & Reports
- Mobile/web bill generation
- PDF/Excel export
- Sales vs stock comparison
- Predictive restocking

### 🌤 Smart Forecasting
- Weather-based predictions
- Seasonal and event-based analysis
- Regional festival considerations

## Quick Start

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **ML Service Setup**:
   ```bash
   cd ml-service
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Environment Variables

Create `.env` files in each service directory with the required API keys and configuration.

## Cost Estimation

- Firebase Hosting & DB: ₹1,000/month
- WhatsApp Business API: ₹0.4/message
- OpenWeather API: Free tier
- n8n Cloud: ₹1,500/month
- Server: ₹1,000/month
- **Total**: ≈ ₹3,500/month (for 100+ shops)