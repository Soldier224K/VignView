# Stock Line - Database Schema Design

**Version:** 1.0  
**Database:** Firebase Firestore (Primary)  
**Date:** October 10, 2025

---

## Schema Overview

Stock Line uses **Firebase Firestore** as the primary database for its flexibility, real-time capabilities, and automatic scaling. The schema is designed to optimize for common query patterns while maintaining data consistency.

---

## 1. Collection: `users`

**Purpose:** Store user authentication and profile information

### Document Structure

```javascript
users/{userId}
{
  // Core fields
  user_id: string (auto-generated)
  email: string (unique, indexed)
  whatsapp_number: string (unique, indexed, format: +91XXXXXXXXXX)
  name: string
  phone: string
  
  // Authentication
  auth_provider: string (enum: 'google', 'whatsapp', 'phone')
  firebase_uid: string
  email_verified: boolean
  
  // Profile
  language_preference: string (default: 'en', options: 'en', 'hi', 'mr', etc.)
  timezone: string (default: 'Asia/Kolkata')
  profile_image_url: string
  
  // Business
  role: string (enum: 'owner', 'manager', 'staff')
  shops: array<string> // Array of shop IDs user has access to
  primary_shop_id: string // Default shop
  
  // Preferences
  notification_preferences: {
    whatsapp: boolean (default: true)
    email: boolean (default: true)
    sms: boolean (default: false)
    push: boolean (default: true)
  }
  
  // Metadata
  created_at: timestamp
  updated_at: timestamp
  last_login: timestamp
  is_active: boolean (default: true)
  subscription_tier: string (enum: 'starter', 'professional', 'business')
}
```

### Indexes
```javascript
// Composite indexes
users: [email, is_active]
users: [whatsapp_number, is_active]
users: [shops, role]
```

### Sample Document
```json
{
  "user_id": "user_abc123",
  "email": "rajesh.kumar@gmail.com",
  "whatsapp_number": "+919876543210",
  "name": "Rajesh Kumar",
  "phone": "+919876543210",
  "auth_provider": "whatsapp",
  "firebase_uid": "firebase_uid_xyz",
  "email_verified": true,
  "language_preference": "hi",
  "timezone": "Asia/Kolkata",
  "profile_image_url": "https://storage.googleapis.com/...",
  "role": "owner",
  "shops": ["shop_123", "shop_456"],
  "primary_shop_id": "shop_123",
  "notification_preferences": {
    "whatsapp": true,
    "email": true,
    "sms": false,
    "push": true
  },
  "created_at": "2025-10-01T10:00:00Z",
  "updated_at": "2025-10-10T08:30:00Z",
  "last_login": "2025-10-10T08:30:00Z",
  "is_active": true,
  "subscription_tier": "professional"
}
```

---

## 2. Collection: `shops`

**Purpose:** Store shop/business information

### Document Structure

```javascript
shops/{shopId}
{
  // Core fields
  shop_id: string (auto-generated)
  shop_name: string
  business_name: string
  owner_id: string (FK to users)
  
  // Shop details
  category: string (enum: 'grocery', 'pharmacy', 'clothing', 'stationery', 'hardware', 'paints', 'general')
  subcategory: string
  description: string
  
  // Location
  location: {
    address: string
    city: string
    state: string
    pincode: string
    country: string (default: 'India')
    coordinates: geopoint {lat, lng}
  }
  
  // Contact
  contact: {
    phone: string
    whatsapp: string
    email: string
    website: string
  }
  
  // Business hours
  business_hours: {
    monday: {open: '09:00', close: '21:00', is_open: true}
    tuesday: {open: '09:00', close: '21:00', is_open: true}
    // ... other days
    sunday: {open: '10:00', close: '20:00', is_open: true}
  }
  
  // Team
  team_members: array<{
    user_id: string
    role: string (enum: 'owner', 'manager', 'staff')
    permissions: array<string>
    added_at: timestamp
  }>
  
  // Subscription
  subscription: {
    tier: string (enum: 'starter', 'professional', 'business')
    status: string (enum: 'active', 'trial', 'expired', 'cancelled')
    start_date: timestamp
    end_date: timestamp
    auto_renew: boolean
  }
  
  // Settings
  settings: {
    currency: string (default: 'INR')
    tax_rate: number (default: 0.18) // 18% GST
    low_stock_threshold_default: number (default: 10)
    invoice_prefix: string (default: 'INV')
    invoice_counter: number (auto-increment)
  }
  
  // Onboarding
  onboarding_completed: boolean
  onboarding_step: number (1-5)
  
  // Metadata
  created_at: timestamp
  updated_at: timestamp
  is_active: boolean
  logo_url: string
  banner_url: string
}
```

### Indexes
```javascript
shops: [owner_id, is_active]
shops: [category, location.city]
shops: ['location.pincode', category]
```

### Sample Document
```json
{
  "shop_id": "shop_123",
  "shop_name": "Kumar General Store",
  "business_name": "Kumar Enterprises",
  "owner_id": "user_abc123",
  "category": "grocery",
  "subcategory": "general_store",
  "description": "Neighborhood grocery store",
  "location": {
    "address": "123, MG Road, Near Temple",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411001",
    "country": "India",
    "coordinates": {"lat": 18.5204, "lng": 73.8567}
  },
  "contact": {
    "phone": "+919876543210",
    "whatsapp": "+919876543210",
    "email": "kumar.store@gmail.com",
    "website": null
  },
  "business_hours": {
    "monday": {"open": "09:00", "close": "21:00", "is_open": true},
    "sunday": {"open": "10:00", "close": "20:00", "is_open": true}
  },
  "team_members": [
    {
      "user_id": "user_abc123",
      "role": "owner",
      "permissions": ["all"],
      "added_at": "2025-10-01T10:00:00Z"
    }
  ],
  "subscription": {
    "tier": "professional",
    "status": "active",
    "start_date": "2025-10-01T00:00:00Z",
    "end_date": "2025-11-01T00:00:00Z",
    "auto_renew": true
  },
  "settings": {
    "currency": "INR",
    "tax_rate": 0.18,
    "low_stock_threshold_default": 10,
    "invoice_prefix": "KGS",
    "invoice_counter": 1543
  },
  "onboarding_completed": true,
  "onboarding_step": 5,
  "created_at": "2025-10-01T10:00:00Z",
  "updated_at": "2025-10-10T08:30:00Z",
  "is_active": true,
  "logo_url": "https://storage.googleapis.com/...",
  "banner_url": null
}
```

---

## 3. Subcollection: `shops/{shopId}/inventory`

**Purpose:** Store product/inventory information for each shop

### Document Structure

```javascript
shops/{shopId}/inventory/{productId}
{
  // Core fields
  product_id: string (auto-generated)
  shop_id: string (parent reference)
  
  // Product details
  name: string (indexed)
  display_name: string
  description: string
  category: string (indexed)
  subcategory: string
  brand: string
  
  // Identification
  barcode: string (indexed)
  sku: string (indexed)
  hsn_code: string // For GST
  
  // Variants
  has_variants: boolean
  variants: array<{
    variant_id: string
    type: string (enum: 'size', 'color', 'flavor', 'weight')
    value: string
    current_quantity: number
    barcode: string
  }>
  
  // Inventory
  current_quantity: number (indexed for low stock queries)
  unit: string (enum: 'pieces', 'kg', 'liter', 'meter', 'box', 'pack')
  low_stock_threshold: number
  reorder_point: number
  reorder_quantity: number
  max_stock_level: number
  
  // Pricing
  cost_price: number
  selling_price: number
  mrp: number
  discount_percentage: number
  tax_rate: number
  
  // Supplier
  supplier: {
    supplier_id: string
    supplier_name: string
    contact: string
    lead_time_days: number
  }
  
  // Tracking
  batch_number: string
  expiry_date: timestamp
  manufacturing_date: timestamp
  
  // Image
  images: array<string> // URLs
  primary_image: string
  
  // Analytics
  total_sold: number
  total_restocked: number
  last_sale_date: timestamp
  last_restock_date: timestamp
  average_daily_sales: number
  turnover_rate: number
  
  // Flags
  is_active: boolean
  is_featured: boolean
  is_perishable: boolean
  
  // Metadata
  created_at: timestamp
  updated_at: timestamp
  created_by: string (user_id)
}
```

### Indexes
```javascript
inventory: [shop_id, current_quantity] // For low stock queries
inventory: [shop_id, category, is_active]
inventory: [barcode, shop_id]
inventory: [name, shop_id] // For search
inventory: [shop_id, last_sale_date] // For trending products
```

### Sample Document
```json
{
  "product_id": "prod_xyz789",
  "shop_id": "shop_123",
  "name": "Maggi Noodles Masala",
  "display_name": "Maggi Noodles Masala 100g",
  "description": "2-minute instant noodles",
  "category": "grocery",
  "subcategory": "instant_food",
  "brand": "Maggi",
  "barcode": "8901058843729",
  "sku": "MAG-100-MSL",
  "hsn_code": "19023090",
  "has_variants": false,
  "variants": [],
  "current_quantity": 45,
  "unit": "pieces",
  "low_stock_threshold": 20,
  "reorder_point": 30,
  "reorder_quantity": 100,
  "max_stock_level": 200,
  "cost_price": 11.50,
  "selling_price": 15.00,
  "mrp": 15.00,
  "discount_percentage": 0,
  "tax_rate": 0.12,
  "supplier": {
    "supplier_id": "sup_123",
    "supplier_name": "Nestle Distributor",
    "contact": "+919123456789",
    "lead_time_days": 3
  },
  "batch_number": "BTH202510A",
  "expiry_date": "2026-10-01T00:00:00Z",
  "manufacturing_date": "2025-04-01T00:00:00Z",
  "images": [
    "https://storage.googleapis.com/stockline/products/prod_xyz789_1.jpg"
  ],
  "primary_image": "https://storage.googleapis.com/stockline/products/prod_xyz789_1.jpg",
  "total_sold": 1250,
  "total_restocked": 1500,
  "last_sale_date": "2025-10-09T18:45:00Z",
  "last_restock_date": "2025-10-05T10:00:00Z",
  "average_daily_sales": 12.5,
  "turnover_rate": 0.28,
  "is_active": true,
  "is_featured": false,
  "is_perishable": false,
  "created_at": "2025-09-01T10:00:00Z",
  "updated_at": "2025-10-10T08:30:00Z",
  "created_by": "user_abc123"
}
```

---

## 4. Subcollection: `shops/{shopId}/inventory/{productId}/movements`

**Purpose:** Track all stock movements (audit trail)

### Document Structure

```javascript
movements/{movementId}
{
  movement_id: string (auto-generated)
  product_id: string (parent reference)
  shop_id: string
  
  type: string (enum: 'restock', 'sale', 'adjustment', 'return', 'damage', 'theft')
  quantity_change: number (positive for addition, negative for reduction)
  
  // Before/After
  quantity_before: number
  quantity_after: number
  
  // Context
  reference_id: string (sale_id or purchase_order_id)
  reason: string
  notes: string
  
  // Who
  performed_by: string (user_id)
  performed_by_name: string
  
  // When
  timestamp: timestamp (indexed)
  
  // For sales
  sale_details: {
    bill_number: string
    customer_name: string
    unit_price: number
    total_price: number
  }
  
  // For restocks
  restock_details: {
    supplier_id: string
    purchase_price: number
    batch_number: string
    expiry_date: timestamp
  }
}
```

### Indexes
```javascript
movements: [product_id, timestamp]
movements: [shop_id, timestamp]
movements: [type, timestamp]
```

### Sample Document
```json
{
  "movement_id": "mov_abc123",
  "product_id": "prod_xyz789",
  "shop_id": "shop_123",
  "type": "sale",
  "quantity_change": -5,
  "quantity_before": 50,
  "quantity_after": 45,
  "reference_id": "sale_bill_1543",
  "reason": "Customer purchase",
  "notes": null,
  "performed_by": "user_abc123",
  "performed_by_name": "Rajesh Kumar",
  "timestamp": "2025-10-10T14:30:00Z",
  "sale_details": {
    "bill_number": "KGS-1543",
    "customer_name": "Walk-in Customer",
    "unit_price": 15.00,
    "total_price": 75.00
  },
  "restock_details": null
}
```

---

## 5. Collection: `sales`

**Purpose:** Store all sales/billing transactions

### Document Structure

```javascript
sales/{saleId}
{
  // Core fields
  sale_id: string (auto-generated)
  shop_id: string (indexed)
  bill_number: string (unique, indexed)
  
  // Items
  items: array<{
    product_id: string
    product_name: string
    variant_id: string (optional)
    variant_details: string
    quantity: number
    unit: string
    unit_price: number
    discount: number
    tax_rate: number
    tax_amount: number
    total_price: number
  }>
  
  // Pricing
  subtotal: number
  total_discount: number
  total_tax: number
  total_amount: number
  
  // Payment
  payment_method: string (enum: 'cash', 'upi', 'card', 'credit')
  payment_status: string (enum: 'paid', 'pending', 'partial')
  amount_paid: number
  amount_pending: number
  
  // Customer
  customer: {
    name: string
    phone: string
    email: string
    address: string
  }
  
  // Invoice
  invoice_url: string (PDF)
  invoice_generated: boolean
  
  // Metadata
  created_at: timestamp (indexed)
  created_by: string (user_id)
  notes: string
  is_cancelled: boolean
  cancelled_at: timestamp
  cancellation_reason: string
}
```

### Indexes
```javascript
sales: [shop_id, created_at DESC]
sales: [shop_id, payment_status, created_at]
sales: [bill_number, shop_id]
sales: ['customer.phone', shop_id]
```

### Sample Document
```json
{
  "sale_id": "sale_xyz789",
  "shop_id": "shop_123",
  "bill_number": "KGS-1543",
  "items": [
    {
      "product_id": "prod_xyz789",
      "product_name": "Maggi Noodles Masala 100g",
      "variant_id": null,
      "variant_details": null,
      "quantity": 5,
      "unit": "pieces",
      "unit_price": 15.00,
      "discount": 0,
      "tax_rate": 0.12,
      "tax_amount": 9.00,
      "total_price": 75.00
    },
    {
      "product_id": "prod_abc456",
      "product_name": "Coca Cola 500ml",
      "variant_id": null,
      "variant_details": null,
      "quantity": 2,
      "unit": "pieces",
      "unit_price": 20.00,
      "discount": 0,
      "tax_rate": 0.12,
      "tax_amount": 4.80,
      "total_price": 40.00
    }
  ],
  "subtotal": 115.00,
  "total_discount": 0,
  "total_tax": 13.80,
  "total_amount": 128.80,
  "payment_method": "upi",
  "payment_status": "paid",
  "amount_paid": 128.80,
  "amount_pending": 0,
  "customer": {
    "name": "Walk-in Customer",
    "phone": null,
    "email": null,
    "address": null
  },
  "invoice_url": "https://storage.googleapis.com/stockline/invoices/KGS-1543.pdf",
  "invoice_generated": true,
  "created_at": "2025-10-10T14:30:00Z",
  "created_by": "user_abc123",
  "notes": null,
  "is_cancelled": false,
  "cancelled_at": null,
  "cancellation_reason": null
}
```

---

## 6. Collection: `alerts`

**Purpose:** Store all system-generated alerts and notifications

### Document Structure

```javascript
alerts/{alertId}
{
  alert_id: string (auto-generated)
  shop_id: string (indexed)
  product_id: string (optional, indexed)
  
  // Alert details
  type: string (enum: 'low_stock', 'reorder', 'anomaly', 'expiry_warning', 'high_sales', 'system')
  priority: string (enum: 'low', 'medium', 'high', 'critical')
  title: string
  message: string
  
  // Additional data
  data: map<string, any> {
    current_quantity: number
    threshold: number
    product_name: string
    // ... other contextual data
  }
  
  // Delivery
  channels: array<string> // ['whatsapp', 'email', 'sms', 'push']
  delivery_status: map<string, string> {
    whatsapp: 'sent' | 'delivered' | 'read' | 'failed'
    email: 'sent' | 'delivered' | 'opened' | 'failed'
    sms: 'sent' | 'delivered' | 'failed'
    push: 'sent' | 'delivered' | 'opened' | 'failed'
  }
  
  // User interaction
  status: string (enum: 'unread', 'read', 'actioned', 'dismissed')
  read_at: timestamp
  actioned_at: timestamp
  action_taken: string
  
  // Metadata
  created_at: timestamp (indexed)
  expires_at: timestamp
  is_active: boolean
}
```

### Indexes
```javascript
alerts: [shop_id, status, created_at DESC]
alerts: [shop_id, type, created_at DESC]
alerts: [product_id, created_at DESC]
alerts: [priority, status, created_at]
```

### Sample Document
```json
{
  "alert_id": "alert_abc123",
  "shop_id": "shop_123",
  "product_id": "prod_xyz789",
  "type": "low_stock",
  "priority": "high",
  "title": "Low Stock Alert: Maggi Noodles",
  "message": "Stock for Maggi Noodles Masala 100g is running low (15 remaining). Consider restocking soon.",
  "data": {
    "current_quantity": 15,
    "threshold": 20,
    "product_name": "Maggi Noodles Masala 100g",
    "reorder_quantity": 100,
    "supplier_name": "Nestle Distributor",
    "estimated_stockout_days": 2
  },
  "channels": ["whatsapp", "push"],
  "delivery_status": {
    "whatsapp": "delivered",
    "push": "sent"
  },
  "status": "read",
  "read_at": "2025-10-10T15:00:00Z",
  "actioned_at": null,
  "action_taken": null,
  "created_at": "2025-10-10T14:45:00Z",
  "expires_at": "2025-10-12T14:45:00Z",
  "is_active": true
}
```

---

## 7. Collection: `forecasts`

**Purpose:** Store AI-generated demand forecasts

### Document Structure

```javascript
forecasts/{forecastId}
{
  forecast_id: string (auto-generated)
  shop_id: string (indexed)
  product_id: string (indexed)
  
  // Forecast details
  forecast_type: string (enum: 'daily', 'weekly', 'monthly')
  forecast_horizon_days: number
  
  // Predictions
  predictions: array<{
    date: timestamp
    predicted_demand: number
    confidence_score: number (0-1)
    lower_bound: number
    upper_bound: number
  }>
  
  // Factors
  factors: {
    historical_average: number
    trend_factor: number
    seasonal_factor: number
    weather_impact: number
    event_impact: number
    day_of_week_factor: number
  }
  
  // Recommendations
  recommendation: string
  reasoning: string
  suggested_reorder_quantity: number
  suggested_reorder_date: timestamp
  
  // Model info
  model_version: string
  model_accuracy: number
  training_data_points: number
  
  // Metadata
  generated_at: timestamp (indexed)
  valid_until: timestamp
  is_active: boolean
}
```

### Indexes
```javascript
forecasts: [shop_id, product_id, generated_at DESC]
forecasts: [shop_id, generated_at DESC]
forecasts: [product_id, generated_at DESC]
```

### Sample Document
```json
{
  "forecast_id": "forecast_abc123",
  "shop_id": "shop_123",
  "product_id": "prod_xyz789",
  "forecast_type": "daily",
  "forecast_horizon_days": 7,
  "predictions": [
    {
      "date": "2025-10-11T00:00:00Z",
      "predicted_demand": 15,
      "confidence_score": 0.82,
      "lower_bound": 12,
      "upper_bound": 18
    },
    {
      "date": "2025-10-12T00:00:00Z",
      "predicted_demand": 18,
      "confidence_score": 0.79,
      "lower_bound": 14,
      "upper_bound": 22
    }
  ],
  "factors": {
    "historical_average": 12.5,
    "trend_factor": 1.05,
    "seasonal_factor": 1.0,
    "weather_impact": 1.1,
    "event_impact": 1.2,
    "day_of_week_factor": 1.0
  },
  "recommendation": "Restock 100 units by Oct 15",
  "reasoning": "Upcoming Diwali festival (Oct 24) combined with favorable weather conditions expected to increase demand by 40%",
  "suggested_reorder_quantity": 100,
  "suggested_reorder_date": "2025-10-15T00:00:00Z",
  "model_version": "v1.2.3",
  "model_accuracy": 0.85,
  "training_data_points": 180,
  "generated_at": "2025-10-10T08:00:00Z",
  "valid_until": "2025-10-17T08:00:00Z",
  "is_active": true
}
```

---

## 8. Collection: `reports`

**Purpose:** Store generated reports (daily, weekly, monthly)

### Document Structure

```javascript
reports/{reportId}
{
  report_id: string (auto-generated)
  shop_id: string (indexed)
  
  // Report details
  report_type: string (enum: 'daily', 'weekly', 'monthly', 'custom')
  period_start: timestamp
  period_end: timestamp
  
  // Summary data
  summary: {
    total_sales: number
    total_revenue: number
    total_bills: number
    total_customers: number
    average_bill_value: number
    
    top_products: array<{
      product_id: string
      product_name: string
      quantity_sold: number
      revenue: number
    }>
    
    low_stock_items: array<{
      product_id: string
      product_name: string
      current_quantity: number
      threshold: number
    }>
    
    out_of_stock_items: array<string>
    
    sales_by_category: map<string, number>
    payment_method_breakdown: map<string, number>
  }
  
  // Charts data
  charts: {
    daily_sales: array<{date: string, revenue: number, count: number}>
    hourly_distribution: array<{hour: number, count: number}>
    category_distribution: array<{category: string, value: number}>
  }
  
  // Files
  pdf_url: string
  excel_url: string
  
  // Metadata
  generated_at: timestamp (indexed)
  generated_by: string (user_id or 'system')
  is_scheduled: boolean
}
```

### Indexes
```javascript
reports: [shop_id, report_type, period_start DESC]
reports: [shop_id, generated_at DESC]
```

---

## 9. Collection: `suppliers`

**Purpose:** Store supplier information

### Document Structure

```javascript
suppliers/{supplierId}
{
  supplier_id: string (auto-generated)
  shop_id: string (indexed)
  
  // Basic info
  name: string
  company_name: string
  gstin: string
  
  // Contact
  contact: {
    phone: string
    whatsapp: string
    email: string
    address: string
    city: string
    state: string
    pincode: string
  }
  
  // Business
  products_supplied: array<string> // product_ids
  categories: array<string>
  lead_time_days: number
  minimum_order_value: number
  payment_terms: string
  
  // Performance
  ratings: {
    quality: number (1-5)
    delivery_time: number (1-5)
    service: number (1-5)
  }
  
  total_orders: number
  total_value: number
  last_order_date: timestamp
  
  // Metadata
  created_at: timestamp
  updated_at: timestamp
  is_active: boolean
}
```

---

## 10. Collection: `whatsapp_conversations`

**Purpose:** Store WhatsApp message history for context

### Document Structure

```javascript
whatsapp_conversations/{conversationId}
{
  conversation_id: string
  user_id: string (indexed)
  shop_id: string (indexed)
  whatsapp_number: string (indexed)
  
  // Messages
  messages: array<{
    message_id: string
    timestamp: timestamp
    direction: string (enum: 'inbound', 'outbound')
    type: string (enum: 'text', 'image', 'audio', 'video', 'document')
    content: string
    media_url: string
    status: string (enum: 'sent', 'delivered', 'read', 'failed')
    
    // For bot responses
    intent: string
    confidence: number
    action_taken: string
  }>
  
  // Context
  last_message_at: timestamp (indexed)
  message_count: number
  
  // Metadata
  created_at: timestamp
  is_active: boolean
}
```

### Indexes
```javascript
whatsapp_conversations: [whatsapp_number, last_message_at DESC]
whatsapp_conversations: [shop_id, last_message_at DESC]
whatsapp_conversations: [user_id, last_message_at DESC]
```

---

## 11. Collection: `image_scans`

**Purpose:** Store image scan history and results

### Document Structure

```javascript
image_scans/{scanId}
{
  scan_id: string (auto-generated)
  shop_id: string (indexed)
  user_id: string
  
  // Image
  image_url: string
  image_size_kb: number
  image_dimensions: {width: number, height: number}
  
  // Processing
  processing_status: string (enum: 'pending', 'processing', 'completed', 'failed')
  processing_time_ms: number
  
  // Results
  detected_products: array<{
    product_id: string (if matched)
    detected_name: string
    confidence: number
    estimated_quantity: number
    bounding_box: {x: number, y: number, width: number, height: number}
    requires_review: boolean
    matched: boolean
  }>
  
  // AI response
  raw_ai_response: map<string, any>
  
  // User actions
  user_confirmed: boolean
  user_corrections: array<{
    detected_name: string
    corrected_product_id: string
    corrected_quantity: number
  }>
  
  // Metadata
  created_at: timestamp (indexed)
  completed_at: timestamp
}
```

---

## Database Optimization Strategies

### 1. Indexing Strategy
- **Single-field indexes:** For simple equality queries
- **Composite indexes:** For complex queries with multiple filters
- **TTL indexes:** For auto-deleting expired data (alerts, sessions)

### 2. Data Denormalization
- Store frequently accessed data together (e.g., product name in sales items)
- Avoid deep nesting (max 3-4 levels)
- Use subcollections for large arrays (e.g., movements)

### 3. Query Optimization
- Use pagination (limit + startAfter) for large result sets
- Cache frequently accessed data in Redis
- Use Firestore's real-time listeners judiciously

### 4. Data Archival
- Archive sales older than 2 years to separate collection
- Archive old movements (keep 1 year in active)
- Compress and export to BigQuery for long-term analytics

### 5. Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasShopAccess(shopId) {
      return isAuthenticated() && 
             shopId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shops;
    }
    
    match /shops/{shopId} {
      allow read: if hasShopAccess(shopId);
      allow write: if hasShopAccess(shopId) && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'manager'];
      
      match /inventory/{productId} {
        allow read: if hasShopAccess(shopId);
        allow write: if hasShopAccess(shopId);
      }
    }
    
    match /sales/{saleId} {
      allow read: if hasShopAccess(resource.data.shop_id);
      allow create: if hasShopAccess(request.resource.data.shop_id);
      allow update, delete: if false; // Sales are immutable (only cancel flag)
    }
  }
}
```

---

## Migration & Backup Strategy

### Daily Backups
- Automated Firestore export to Cloud Storage
- Retention: 30 days
- Schedule: 2 AM IST daily

### Weekly Full Backup
- Export to BigQuery for analytics
- Export to S3 for disaster recovery
- Retention: 1 year

### Point-in-Time Recovery
- Firestore supports PITR for 7 days
- For critical operations, create manual snapshots

---

**Document Owner:** Database Architect, Stock Line  
**Last Updated:** 2025-10-10  
**Next Review:** 2025-11-10
