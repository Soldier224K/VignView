# Stock Line - API Specification

**Version:** 1.0  
**Base URL:** `https://api.stockline.app/v1`  
**Date:** October 10, 2025

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Shop Management](#2-shop-management)
3. [Inventory Management](#3-inventory-management)
4. [Billing](#4-billing)
5. [Reports & Analytics](#5-reports--analytics)
6. [Forecasting](#6-forecasting)
7. [Alerts](#7-alerts)
8. [WhatsApp Integration](#8-whatsapp-integration)
9. [Image Processing](#9-image-processing)
10. [Error Codes](#10-error-codes)

---

## API Conventions

### Request Headers
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-Shop-ID: {shop_id} (for multi-shop users)
X-API-Version: v1
```

### Response Format
**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-10-10T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Product name is required",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-10-10T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_more": true,
    "next_cursor": "cursor_xyz"
  }
}
```

---

## 1. Authentication

### 1.1 Register User
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@gmail.com",
  "whatsapp_number": "+919876543210",
  "password": "SecurePass123!",
  "language_preference": "hi"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user_abc123",
    "email": "rajesh@gmail.com",
    "whatsapp_number": "+919876543210",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "refresh_token_xyz",
    "expires_in": 3600
  }
}
```

---

### 1.2 Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "rajesh@gmail.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user_abc123",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "refresh_token_xyz",
    "expires_in": 3600,
    "user": {
      "name": "Rajesh Kumar",
      "email": "rajesh@gmail.com",
      "shops": ["shop_123"],
      "role": "owner"
    }
  }
}
```

---

### 1.3 WhatsApp OTP Login
**Endpoint:** `POST /auth/whatsapp-otp`

**Request Body (Step 1 - Send OTP):**
```json
{
  "whatsapp_number": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "otp_sent": true,
    "expires_in": 300,
    "session_id": "session_xyz"
  }
}
```

**Request Body (Step 2 - Verify OTP):**
```json
{
  "whatsapp_number": "+919876543210",
  "otp": "123456",
  "session_id": "session_xyz"
}
```

**Response:** (Same as login response)

---

### 1.4 Refresh Token
**Endpoint:** `POST /auth/refresh-token`

**Request Body:**
```json
{
  "refresh_token": "refresh_token_xyz"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "new_access_token",
    "expires_in": 3600
  }
}
```

---

### 1.5 Logout
**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## 2. Shop Management

### 2.1 Create Shop
**Endpoint:** `POST /shops`

**Request Body:**
```json
{
  "shop_name": "Kumar General Store",
  "business_name": "Kumar Enterprises",
  "category": "grocery",
  "subcategory": "general_store",
  "location": {
    "address": "123, MG Road",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411001",
    "coordinates": {
      "lat": 18.5204,
      "lng": 73.8567
    }
  },
  "contact": {
    "phone": "+919876543210",
    "whatsapp": "+919876543210",
    "email": "kumar.store@gmail.com"
  },
  "business_hours": {
    "monday": {"open": "09:00", "close": "21:00", "is_open": true},
    "tuesday": {"open": "09:00", "close": "21:00", "is_open": true},
    "wednesday": {"open": "09:00", "close": "21:00", "is_open": true},
    "thursday": {"open": "09:00", "close": "21:00", "is_open": true},
    "friday": {"open": "09:00", "close": "21:00", "is_open": true},
    "saturday": {"open": "09:00", "close": "21:00", "is_open": true},
    "sunday": {"open": "10:00", "close": "20:00", "is_open": true}
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shop_id": "shop_123",
    "shop_name": "Kumar General Store",
    "category": "grocery",
    "created_at": "2025-10-10T10:30:00Z",
    "onboarding_step": 1
  }
}
```

---

### 2.2 Get Shop Details
**Endpoint:** `GET /shops/:shopId`

**Response:**
```json
{
  "success": true,
  "data": {
    "shop_id": "shop_123",
    "shop_name": "Kumar General Store",
    "business_name": "Kumar Enterprises",
    "category": "grocery",
    "location": { ... },
    "contact": { ... },
    "business_hours": { ... },
    "subscription": {
      "tier": "professional",
      "status": "active",
      "end_date": "2025-11-10T00:00:00Z"
    },
    "stats": {
      "total_products": 250,
      "low_stock_items": 12,
      "total_sales_this_month": 1250000,
      "total_bills_this_month": 850
    }
  }
}
```

---

### 2.3 Update Shop
**Endpoint:** `PUT /shops/:shopId`

**Request Body:** (Any fields from create shop)
```json
{
  "shop_name": "Kumar General Store & More",
  "contact": {
    "phone": "+919876543210"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shop_id": "shop_123",
    "updated_at": "2025-10-10T10:30:00Z"
  }
}
```

---

### 2.4 Get Shop Statistics
**Endpoint:** `GET /shops/:shopId/stats`

**Query Parameters:**
- `period`: `today` | `week` | `month` | `year` (default: `today`)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "today",
    "sales": {
      "total_revenue": 12500.00,
      "total_bills": 45,
      "average_bill_value": 277.78,
      "total_items_sold": 230
    },
    "inventory": {
      "total_products": 250,
      "low_stock_items": 12,
      "out_of_stock_items": 3,
      "total_inventory_value": 350000.00
    },
    "top_selling_products": [
      {
        "product_id": "prod_xyz",
        "product_name": "Maggi Noodles",
        "quantity_sold": 25,
        "revenue": 375.00
      }
    ],
    "alerts": {
      "unread_count": 5,
      "critical_count": 2
    }
  }
}
```

---

## 3. Inventory Management

### 3.1 Add Product
**Endpoint:** `POST /shops/:shopId/inventory`

**Request Body:**
```json
{
  "name": "Maggi Noodles Masala",
  "display_name": "Maggi Noodles Masala 100g",
  "category": "grocery",
  "subcategory": "instant_food",
  "brand": "Maggi",
  "barcode": "8901058843729",
  "current_quantity": 100,
  "unit": "pieces",
  "low_stock_threshold": 20,
  "reorder_point": 30,
  "reorder_quantity": 100,
  "cost_price": 11.50,
  "selling_price": 15.00,
  "mrp": 15.00,
  "tax_rate": 0.12,
  "supplier": {
    "supplier_name": "Nestle Distributor",
    "contact": "+919123456789"
  },
  "expiry_date": "2026-10-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product_id": "prod_xyz789",
    "name": "Maggi Noodles Masala",
    "current_quantity": 100,
    "created_at": "2025-10-10T10:30:00Z"
  }
}
```

---

### 3.2 Get All Products
**Endpoint:** `GET /shops/:shopId/inventory`

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `category`: string
- `search`: string (search by name/barcode)
- `status`: `active` | `low_stock` | `out_of_stock`
- `sort_by`: `name` | `quantity` | `last_updated` (default: `name`)
- `order`: `asc` | `desc` (default: `asc`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "prod_xyz789",
      "name": "Maggi Noodles Masala",
      "display_name": "Maggi Noodles Masala 100g",
      "category": "grocery",
      "brand": "Maggi",
      "barcode": "8901058843729",
      "current_quantity": 45,
      "unit": "pieces",
      "low_stock_threshold": 20,
      "selling_price": 15.00,
      "status": "active",
      "last_updated": "2025-10-09T18:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 250,
    "total_pages": 13
  }
}
```

---

### 3.3 Get Product Details
**Endpoint:** `GET /shops/:shopId/inventory/:productId`

**Response:**
```json
{
  "success": true,
  "data": {
    "product_id": "prod_xyz789",
    "name": "Maggi Noodles Masala",
    "display_name": "Maggi Noodles Masala 100g",
    "description": "2-minute instant noodles",
    "category": "grocery",
    "subcategory": "instant_food",
    "brand": "Maggi",
    "barcode": "8901058843729",
    "current_quantity": 45,
    "unit": "pieces",
    "low_stock_threshold": 20,
    "reorder_point": 30,
    "reorder_quantity": 100,
    "cost_price": 11.50,
    "selling_price": 15.00,
    "mrp": 15.00,
    "tax_rate": 0.12,
    "supplier": { ... },
    "images": ["https://..."],
    "analytics": {
      "total_sold": 1250,
      "average_daily_sales": 12.5,
      "last_sale_date": "2025-10-09T18:45:00Z",
      "turnover_rate": 0.28
    },
    "created_at": "2025-09-01T10:00:00Z",
    "updated_at": "2025-10-10T08:30:00Z"
  }
}
```

---

### 3.4 Update Product
**Endpoint:** `PUT /shops/:shopId/inventory/:productId`

**Request Body:** (Any fields from add product)
```json
{
  "current_quantity": 150,
  "selling_price": 16.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product_id": "prod_xyz789",
    "updated_fields": ["current_quantity", "selling_price"],
    "updated_at": "2025-10-10T10:30:00Z"
  }
}
```

---

### 3.5 Delete Product
**Endpoint:** `DELETE /shops/:shopId/inventory/:productId`

**Response:**
```json
{
  "success": true,
  "data": {
    "product_id": "prod_xyz789",
    "deleted_at": "2025-10-10T10:30:00Z"
  }
}
```

---

### 3.6 Bulk Update Inventory
**Endpoint:** `POST /shops/:shopId/inventory/bulk-update`

**Request Body:**
```json
{
  "updates": [
    {
      "product_id": "prod_xyz789",
      "current_quantity": 150
    },
    {
      "product_id": "prod_abc456",
      "current_quantity": 80
    }
  ],
  "reason": "Monthly stock count",
  "notes": "Physical verification completed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated_count": 2,
    "failed_count": 0,
    "details": [
      {
        "product_id": "prod_xyz789",
        "status": "success",
        "old_quantity": 45,
        "new_quantity": 150
      },
      {
        "product_id": "prod_abc456",
        "status": "success",
        "old_quantity": 60,
        "new_quantity": 80
      }
    ]
  }
}
```

---

### 3.7 Get Stock Movements
**Endpoint:** `GET /shops/:shopId/inventory/:productId/movements`

**Query Parameters:**
- `page`: number
- `limit`: number
- `type`: `restock` | `sale` | `adjustment` | `return`
- `start_date`: ISO date
- `end_date`: ISO date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "movement_id": "mov_abc123",
      "type": "sale",
      "quantity_change": -5,
      "quantity_before": 50,
      "quantity_after": 45,
      "performed_by": "Rajesh Kumar",
      "timestamp": "2025-10-10T14:30:00Z",
      "reference": {
        "type": "bill",
        "id": "sale_bill_1543",
        "bill_number": "KGS-1543"
      }
    }
  ],
  "pagination": { ... }
}
```

---

## 4. Billing

### 4.1 Create Bill
**Endpoint:** `POST /shops/:shopId/bills`

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "prod_xyz789",
      "quantity": 5,
      "unit_price": 15.00,
      "discount": 0
    },
    {
      "product_id": "prod_abc456",
      "quantity": 2,
      "unit_price": 20.00,
      "discount": 0
    }
  ],
  "payment_method": "upi",
  "customer": {
    "name": "Amit Sharma",
    "phone": "+919123456789"
  },
  "notes": "Regular customer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sale_id": "sale_xyz789",
    "bill_number": "KGS-1543",
    "total_amount": 128.80,
    "items_count": 2,
    "payment_status": "paid",
    "invoice_url": "https://storage.googleapis.com/stockline/invoices/KGS-1543.pdf",
    "created_at": "2025-10-10T14:30:00Z"
  }
}
```

---

### 4.2 Get Bills
**Endpoint:** `GET /shops/:shopId/bills`

**Query Parameters:**
- `page`: number
- `limit`: number
- `start_date`: ISO date
- `end_date`: ISO date
- `payment_method`: string
- `payment_status`: `paid` | `pending` | `partial`
- `search`: string (bill number or customer phone)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sale_id": "sale_xyz789",
      "bill_number": "KGS-1543",
      "total_amount": 128.80,
      "payment_method": "upi",
      "payment_status": "paid",
      "customer_name": "Amit Sharma",
      "items_count": 2,
      "created_at": "2025-10-10T14:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 4.3 Get Bill Details
**Endpoint:** `GET /shops/:shopId/bills/:saleId`

**Response:**
```json
{
  "success": true,
  "data": {
    "sale_id": "sale_xyz789",
    "bill_number": "KGS-1543",
    "shop_name": "Kumar General Store",
    "items": [
      {
        "product_name": "Maggi Noodles Masala 100g",
        "quantity": 5,
        "unit_price": 15.00,
        "tax_rate": 0.12,
        "tax_amount": 9.00,
        "total_price": 75.00
      },
      {
        "product_name": "Coca Cola 500ml",
        "quantity": 2,
        "unit_price": 20.00,
        "tax_rate": 0.12,
        "tax_amount": 4.80,
        "total_price": 40.00
      }
    ],
    "subtotal": 115.00,
    "total_tax": 13.80,
    "total_amount": 128.80,
    "payment_method": "upi",
    "payment_status": "paid",
    "customer": {
      "name": "Amit Sharma",
      "phone": "+919123456789"
    },
    "invoice_url": "https://storage.googleapis.com/.../KGS-1543.pdf",
    "created_at": "2025-10-10T14:30:00Z"
  }
}
```

---

### 4.4 Download Bill PDF
**Endpoint:** `GET /shops/:shopId/bills/:saleId/pdf`

**Response:** Binary PDF file

---

### 4.5 Export Bills
**Endpoint:** `POST /shops/:shopId/bills/export`

**Request Body:**
```json
{
  "format": "excel",
  "start_date": "2025-10-01",
  "end_date": "2025-10-31",
  "filters": {
    "payment_method": "upi"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "export_id": "export_abc123",
    "download_url": "https://storage.googleapis.com/.../bills_oct_2025.xlsx",
    "expires_at": "2025-10-11T10:30:00Z",
    "record_count": 850
  }
}
```

---

## 5. Reports & Analytics

### 5.1 Get Daily Report
**Endpoint:** `GET /shops/:shopId/reports/daily`

**Query Parameters:**
- `date`: YYYY-MM-DD (default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "report_type": "daily",
    "date": "2025-10-10",
    "summary": {
      "total_sales": 12500.00,
      "total_revenue": 12500.00,
      "total_bills": 45,
      "total_customers": 42,
      "average_bill_value": 277.78
    },
    "top_products": [
      {
        "product_name": "Maggi Noodles",
        "quantity_sold": 25,
        "revenue": 375.00
      }
    ],
    "low_stock_items": [
      {
        "product_name": "Coca Cola 500ml",
        "current_quantity": 8,
        "threshold": 20
      }
    ],
    "sales_by_hour": [
      {"hour": 9, "revenue": 500.00, "count": 3},
      {"hour": 10, "revenue": 1200.00, "count": 7}
    ],
    "payment_breakdown": {
      "cash": 4500.00,
      "upi": 6000.00,
      "card": 2000.00
    }
  }
}
```

---

### 5.2 Get Weekly Report
**Endpoint:** `GET /shops/:shopId/reports/weekly`

**Query Parameters:**
- `week`: Week number (1-52)
- `year`: YYYY (default: current year)

**Response:** (Similar structure to daily, with weekly aggregations)

---

### 5.3 Get Monthly Report
**Endpoint:** `GET /shops/:shopId/reports/monthly`

**Query Parameters:**
- `month`: MM (1-12)
- `year`: YYYY (default: current year)

**Response:** (Similar structure to daily, with monthly aggregations)

---

### 5.4 Generate Custom Report
**Endpoint:** `POST /shops/:shopId/reports/custom`

**Request Body:**
```json
{
  "start_date": "2025-10-01",
  "end_date": "2025-10-10",
  "metrics": ["sales", "inventory", "customers"],
  "group_by": "day",
  "filters": {
    "category": "grocery",
    "payment_method": "upi"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": "report_abc123",
    "generated_at": "2025-10-10T10:30:00Z",
    "data": { ... },
    "download_urls": {
      "pdf": "https://...",
      "excel": "https://..."
    }
  }
}
```

---

## 6. Forecasting

### 6.1 Generate Forecast
**Endpoint:** `POST /shops/:shopId/forecasts/generate`

**Request Body:**
```json
{
  "product_ids": ["prod_xyz789", "prod_abc456"],
  "forecast_days": 7,
  "include_factors": true
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
        "product_name": "Maggi Noodles Masala 100g",
        "daily_predictions": [
          {
            "date": "2025-10-11",
            "predicted_demand": 15,
            "confidence": 0.82,
            "lower_bound": 12,
            "upper_bound": 18
          }
        ],
        "recommendation": "Restock 100 units by Oct 15",
        "reasoning": "Upcoming festival + favorable weather",
        "factors": {
          "historical_average": 12.5,
          "weather_impact": 1.1,
          "event_impact": 1.2
        }
      }
    ]
  }
}
```

---

### 6.2 Get Forecasts
**Endpoint:** `GET /shops/:shopId/forecasts`

**Query Parameters:**
- `product_id`: string (optional)
- `active_only`: boolean (default: true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "forecast_id": "forecast_123",
      "product_name": "Maggi Noodles",
      "forecast_type": "daily",
      "forecast_days": 7,
      "generated_at": "2025-10-10T08:00:00Z",
      "valid_until": "2025-10-17T08:00:00Z",
      "recommendation": "Restock 100 units by Oct 15"
    }
  ]
}
```

---

### 6.3 Get Weather Forecast
**Endpoint:** `GET /shops/:shopId/weather`

**Query Parameters:**
- `days`: number (1-7, default: 3)

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "city": "Pune",
      "coordinates": {"lat": 18.5204, "lng": 73.8567}
    },
    "forecast": [
      {
        "date": "2025-10-11",
        "temperature": {
          "min": 22,
          "max": 32,
          "unit": "celsius"
        },
        "weather": "Sunny",
        "precipitation_probability": 0.1,
        "humidity": 60
      }
    ],
    "impact_analysis": {
      "cold_drinks": "High demand expected",
      "umbrellas": "Low demand expected"
    }
  }
}
```

---

## 7. Alerts

### 7.1 Get Alerts
**Endpoint:** `GET /shops/:shopId/alerts`

**Query Parameters:**
- `status`: `unread` | `read` | `actioned` | `dismissed`
- `type`: `low_stock` | `reorder` | `anomaly` | `expiry_warning`
- `priority`: `low` | `medium` | `high` | `critical`
- `page`: number
- `limit`: number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "alert_id": "alert_abc123",
      "type": "low_stock",
      "priority": "high",
      "title": "Low Stock Alert: Maggi Noodles",
      "message": "Stock running low (15 remaining). Consider restocking soon.",
      "product": {
        "product_id": "prod_xyz789",
        "product_name": "Maggi Noodles Masala 100g",
        "current_quantity": 15,
        "threshold": 20
      },
      "status": "unread",
      "created_at": "2025-10-10T14:45:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 7.2 Mark Alert as Read
**Endpoint:** `PUT /shops/:shopId/alerts/:alertId/read`

**Response:**
```json
{
  "success": true,
  "data": {
    "alert_id": "alert_abc123",
    "status": "read",
    "read_at": "2025-10-10T15:00:00Z"
  }
}
```

---

### 7.3 Update Alert Settings
**Endpoint:** `POST /shops/:shopId/alerts/settings`

**Request Body:**
```json
{
  "low_stock_alerts": {
    "enabled": true,
    "channels": ["whatsapp", "push"],
    "frequency": "immediate"
  },
  "expiry_warnings": {
    "enabled": true,
    "channels": ["whatsapp", "email"],
    "days_before": 30
  },
  "daily_summary": {
    "enabled": true,
    "channels": ["whatsapp"],
    "time": "08:00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated_at": "2025-10-10T10:30:00Z"
  }
}
```

---

## 8. WhatsApp Integration

### 8.1 WhatsApp Webhook (Internal)
**Endpoint:** `POST /webhooks/whatsapp`

**Request Body:** (From WhatsApp Business API)
```json
{
  "from": "+919876543210",
  "message": {
    "type": "text",
    "text": "Check maggi stock"
  },
  "timestamp": "2025-10-10T10:30:00Z"
}
```

**Processing:**
- Parse intent
- Execute action
- Send response via WhatsApp API

---

### 8.2 Send Manual WhatsApp Message
**Endpoint:** `POST /shops/:shopId/whatsapp/send`

**Request Body:**
```json
{
  "to": "+919876543210",
  "type": "text",
  "message": "Your order is ready for pickup!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message_id": "msg_abc123",
    "status": "sent",
    "sent_at": "2025-10-10T10:30:00Z"
  }
}
```

---

## 9. Image Processing

### 9.1 Upload & Scan Image
**Endpoint:** `POST /shops/:shopId/inventory/image-scan`

**Request:** `multipart/form-data`
- `file`: Image file (JPEG/PNG, max 10MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "scan_id": "scan_abc123",
    "processing_time_ms": 2350,
    "detected_products": [
      {
        "detected_name": "Coca Cola 500ml",
        "product_id": "prod_abc456",
        "confidence": 0.95,
        "estimated_quantity": 12,
        "matched": true,
        "requires_review": false
      },
      {
        "detected_name": "Unknown Bottle",
        "product_id": null,
        "confidence": 0.45,
        "estimated_quantity": 3,
        "matched": false,
        "requires_review": true
      }
    ],
    "image_url": "https://storage.googleapis.com/.../scan_abc123.jpg"
  }
}
```

---

### 9.2 Confirm Scan Results
**Endpoint:** `POST /shops/:shopId/inventory/image-scan/:scanId/confirm`

**Request Body:**
```json
{
  "corrections": [
    {
      "detected_name": "Unknown Bottle",
      "product_id": "prod_xyz999",
      "quantity": 5
    }
  ],
  "apply_to_inventory": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scan_id": "scan_abc123",
    "products_updated": 2,
    "inventory_updated": true
  }
}
```

---

## 10. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SUCCESS` | 200 | Request successful |
| `CREATED` | 201 | Resource created |
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (duplicate) |
| `VALIDATION_ERROR` | 422 | Validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Error Response Examples

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "password": "Password must be at least 8 characters"
      }
    }
  }
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**Rate Limit Error:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "retry_after": 60,
      "limit": 100,
      "window": "1 minute"
    }
  }
}
```

---

## Rate Limits

| Endpoint Pattern | Limit | Window |
|------------------|-------|--------|
| `/auth/*` | 5 requests | 15 minutes |
| `/*/image-scan` | 10 requests | 1 minute |
| `/*/bills` | 50 requests | 1 minute |
| All other endpoints | 100 requests | 1 minute |

---

## Versioning

API versioning is handled via URL path: `/v1/`, `/v2/`, etc.

**Deprecation Policy:**
- 6 months notice before deprecation
- Old versions supported for 12 months after deprecation notice

---

## Testing

**Sandbox Environment:** `https://api-sandbox.stockline.app/v1`

**Test Credentials:**
```
Email: test@stockline.app
Password: TestPass123!
```

**Test Shop ID:** `shop_test_123`

---

**Document Owner:** API Team, Stock Line  
**Last Updated:** 2025-10-10  
**Next Review:** 2025-11-10
