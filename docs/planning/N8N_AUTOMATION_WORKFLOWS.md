# Stock Line - n8n Automation Workflows

**Version:** 1.0  
**Date:** October 10, 2025  
**Platform:** n8n (self-hosted/cloud)

---

## Table of Contents

1. [Overview](#overview)
2. [Workflow Templates](#workflow-templates)
3. [Setup Instructions](#setup-instructions)
4. [Workflow Details](#workflow-details)
5. [Custom Workflows](#custom-workflows)
6. [Monitoring & Debugging](#monitoring--debugging)

---

## Overview

Stock Line uses **n8n** as its automation engine to handle:
- Automated alerts and notifications
- Report generation and distribution
- Restock order management
- Customer communications
- Data synchronization

**n8n Benefits:**
- Visual workflow builder (no-code)
- Self-hostable (data privacy)
- 200+ integrations
- Webhook support
- Error handling & retries

---

## Workflow Templates

### Summary of Pre-built Workflows

| Workflow | Trigger | Actions | Frequency |
|----------|---------|---------|-----------|
| **Low Stock Alert** | Inventory threshold | WhatsApp + Email | Real-time |
| **Daily Sales Report** | Cron (8 AM daily) | Generate report + WhatsApp | Daily |
| **Weekly Summary** | Cron (Sunday 8 PM) | Aggregate data + Email + WhatsApp | Weekly |
| **Restock Order** | User confirmation | Create order + Notify supplier | On-demand |
| **High Sales Alert** | Sales threshold | WhatsApp notification | Real-time |
| **Expiry Warning** | Cron (daily check) | WhatsApp alert | Daily |
| **Out of Stock Alert** | Inventory = 0 | WhatsApp + SMS | Real-time |
| **Customer Receipt** | Bill created | WhatsApp PDF | Real-time |

---

## Setup Instructions

### 1. n8n Installation

**Option A: Self-Hosted (Docker)**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=your_password \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Option B: n8n Cloud**
- Sign up at https://n8n.io
- Create workspace
- Connect to Stock Line API

---

### 2. Configure Credentials

**Required Credentials:**

#### Stock Line API
- **Type:** HTTP Basic Auth / API Key
- **API URL:** `https://api.stockline.app/v1`
- **API Key:** Get from Stock Line dashboard

#### WhatsApp Business API
- **Type:** WhatsApp Business Cloud API
- **Access Token:** From Meta Business Manager
- **Phone Number ID:** Your WhatsApp Business number

#### Email (SendGrid)
- **Type:** SendGrid
- **API Key:** From SendGrid dashboard

#### SMS (Twilio)
- **Type:** Twilio
- **Account SID:** From Twilio console
- **Auth Token:** From Twilio console

#### Google Sheets (Optional)
- **Type:** Google Service Account
- **JSON Key:** Service account credentials

---

### 3. Import Workflows

1. Download workflow JSON files from Stock Line repo
2. In n8n, go to **Workflows** → **Import from File**
3. Select workflow JSON
4. Configure credentials
5. Activate workflow

---

## Workflow Details

### 1. Low Stock Alert Workflow

**Workflow ID:** `low-stock-alert`  
**Trigger:** Webhook from Stock Line API  
**Frequency:** Real-time

#### Flow Diagram
```
Webhook (Stock Line)
  ↓
Filter: Check if alert not sent in last 24h
  ↓
Fetch Product Details (API)
  ↓
Fetch Shop Owner Contact (API)
  ↓
Create WhatsApp Message
  ↓
Send WhatsApp Message
  ↓
If Priority = Critical → Send SMS
  ↓
Log Alert in Database (API)
  ↓
End
```

#### Configuration

**Webhook URL:** `https://n8n.stockline.app/webhook/low-stock`

**Nodes:**

1. **Webhook Trigger**
   - Method: POST
   - Path: `/webhook/low-stock`
   
   **Payload:**
   ```json
   {
     "shop_id": "shop_123",
     "product_id": "prod_xyz",
     "product_name": "Maggi Noodles",
     "current_quantity": 8,
     "threshold": 20,
     "priority": "high"
   }
   ```

2. **Filter: Check Last Alert**
   - Node: IF
   - Condition: `{{$json.last_alert_time}} < {{Date.now() - 86400000}}`
   - Description: Prevent alert fatigue (max 1 alert per 24h)

3. **Fetch Shop Owner**
   - Node: HTTP Request
   - Method: GET
   - URL: `{{$env.API_URL}}/shops/{{$json.shop_id}}`
   - Headers: `Authorization: Bearer {{$credentials.api_key}}`

4. **Create WhatsApp Message**
   - Node: Code
   - Language: JavaScript
   ```javascript
   const product = $input.first().json;
   const shop = $('Fetch Shop Owner').first().json;
   
   return {
     to: shop.contact.whatsapp,
     message: `🚨 *Low Stock Alert*\n\n` +
              `Product: ${product.product_name}\n` +
              `Current Stock: ${product.current_quantity}\n` +
              `Threshold: ${product.threshold}\n\n` +
              `⚠️ Consider restocking soon!\n\n` +
              `Reply "RESTOCK" to create an order.`,
     priority: product.priority
   };
   ```

5. **Send WhatsApp**
   - Node: WhatsApp Business
   - To: `{{$json.to}}`
   - Message: `{{$json.message}}`

6. **IF: Critical Priority**
   - Node: IF
   - Condition: `{{$json.priority}} === 'critical'`

7. **Send SMS (if critical)**
   - Node: Twilio
   - To: `{{$('Fetch Shop Owner').json.contact.phone}}`
   - Message: `URGENT: ${product_name} out of stock!`

8. **Log Alert**
   - Node: HTTP Request
   - Method: POST
   - URL: `{{$env.API_URL}}/alerts`
   - Body:
   ```json
   {
     "shop_id": "{{$json.shop_id}}",
     "product_id": "{{$json.product_id}}",
     "type": "low_stock",
     "message": "{{$json.message}}",
     "channels": ["whatsapp"],
     "status": "sent"
   }
   ```

---

### 2. Daily Sales Report Workflow

**Workflow ID:** `daily-sales-report`  
**Trigger:** Cron schedule  
**Frequency:** Daily at 8:00 AM

#### Flow Diagram
```
Cron Trigger (8 AM)
  ↓
Fetch All Active Shops (API)
  ↓
For Each Shop:
  ├─ Fetch Yesterday's Sales (API)
  ├─ Fetch Current Stock Levels (API)
  ├─ Calculate Top Products
  ├─ Identify Low Stock Items
  ├─ Generate Summary Text
  ├─ Create PDF Report (API)
  └─ Send WhatsApp with PDF
  ↓
Log Report Sent (API)
  ↓
End
```

#### Configuration

**Nodes:**

1. **Cron Trigger**
   - Schedule: `0 8 * * *` (8 AM daily)
   - Timezone: Asia/Kolkata

2. **Fetch Active Shops**
   - Node: HTTP Request
   - Method: GET
   - URL: `{{$env.API_URL}}/shops?status=active`

3. **Loop: For Each Shop**
   - Node: SplitInBatches
   - Batch Size: 1

4. **Fetch Yesterday's Sales**
   - Node: HTTP Request
   - Method: GET
   - URL: `{{$env.API_URL}}/shops/{{$json.shop_id}}/reports/daily?date={{Date.yesterday}}`

5. **Generate Summary**
   - Node: Code
   - Language: JavaScript
   ```javascript
   const sales = $input.first().json;
   
   const summary = 
     `📊 *Daily Sales Report*\n` +
     `Date: ${new Date().toLocaleDateString('en-IN')}\n\n` +
     `💰 Total Revenue: ₹${sales.summary.total_revenue}\n` +
     `📝 Total Bills: ${sales.summary.total_bills}\n` +
     `🛒 Items Sold: ${sales.summary.total_items_sold}\n` +
     `💳 Avg Bill: ₹${sales.summary.average_bill_value}\n\n` +
     `🏆 *Top Products:*\n`;
   
   sales.top_products.forEach((p, i) => {
     summary += `${i+1}. ${p.product_name} (${p.quantity_sold} sold)\n`;
   });
   
   if (sales.low_stock_items.length > 0) {
     summary += `\n⚠️ *Low Stock Alerts:*\n`;
     sales.low_stock_items.forEach(item => {
       summary += `• ${item.product_name} (${item.current_quantity} left)\n`;
     });
   }
   
   return {
     message: summary,
     pdf_needed: true
   };
   ```

6. **Generate PDF Report**
   - Node: HTTP Request
   - Method: POST
   - URL: `{{$env.API_URL}}/shops/{{$json.shop_id}}/reports/generate-pdf`
   - Response: `{ "pdf_url": "..." }`

7. **Send WhatsApp with PDF**
   - Node: WhatsApp Business
   - To: `{{$('Fetch Active Shops').json.contact.whatsapp}}`
   - Message: `{{$('Generate Summary').json.message}}`
   - Media URL: `{{$('Generate PDF Report').json.pdf_url}}`

8. **Log Report**
   - Node: HTTP Request
   - Method: POST
   - URL: `{{$env.API_URL}}/shops/{{$json.shop_id}}/reports`
   - Body: Report data

---

### 3. Restock Order Workflow

**Workflow ID:** `restock-order`  
**Trigger:** Webhook (WhatsApp reply "RESTOCK")  
**Frequency:** On-demand

#### Flow Diagram
```
Webhook (WhatsApp Reply)
  ↓
Parse Message: Extract Product
  ↓
Fetch Product Details (API)
  ↓
Create Purchase Order
  ↓
Add to Google Sheets (optional)
  ↓
Email Supplier
  ↓
WhatsApp Confirmation to Owner
  ↓
Update Inventory Status (API)
  ↓
End
```

#### Configuration

**Nodes:**

1. **Webhook Trigger**
   - Method: POST
   - Path: `/webhook/whatsapp-reply`
   
   **Payload:**
   ```json
   {
     "from": "+919876543210",
     "message": "RESTOCK Maggi",
     "context": {
       "shop_id": "shop_123",
       "product_id": "prod_xyz"
     }
   }
   ```

2. **Parse Message**
   - Node: Code
   - Extract product name from message

3. **Fetch Product Details**
   - Node: HTTP Request
   - URL: `{{$env.API_URL}}/shops/{{$json.shop_id}}/inventory/{{$json.product_id}}`

4. **Create Purchase Order**
   - Node: Code
   - Generate PO number, calculate quantity

5. **Add to Google Sheets**
   - Node: Google Sheets
   - Sheet: "Purchase Orders"
   - Action: Append row
   - Data: PO details

6. **Email Supplier**
   - Node: SendGrid
   - To: `{{$('Fetch Product Details').json.supplier.email}}`
   - Subject: `Purchase Order #{{$json.po_number}}`
   - Body: PO template

7. **WhatsApp Confirmation**
   - Node: WhatsApp Business
   - Message: 
   ```
   ✅ *Restock Order Created*
   
   Product: {{product_name}}
   Quantity: {{quantity}}
   Supplier: {{supplier_name}}
   PO Number: {{po_number}}
   
   Expected Delivery: {{estimated_delivery}}
   ```

8. **Update Inventory**
   - Node: HTTP Request
   - Method: PATCH
   - URL: `{{$env.API_URL}}/shops/{{$json.shop_id}}/inventory/{{$json.product_id}}`
   - Body: `{ "restock_status": "ordered" }`

---

### 4. High Sales Alert Workflow

**Workflow ID:** `high-sales-alert`  
**Trigger:** Webhook from Sales API  
**Frequency:** Real-time

#### Flow Diagram
```
Webhook (Bill Created)
  ↓
Calculate Daily Sales
  ↓
IF: Sales > Threshold
  ↓
Create Congratulatory Message
  ↓
Send WhatsApp
  ↓
Log Achievement (API)
  ↓
End
```

#### Configuration

**Trigger Condition:**
- Daily sales exceed ₹50,000
- OR: Single bill > ₹5,000

**WhatsApp Message:**
```
🎉 *Congratulations!*

You've crossed ₹50,000 in sales today!

Keep up the great work! 💪

Current total: ₹{{total_sales}}
Bills: {{bill_count}}
```

---

### 5. Expiry Warning Workflow

**Workflow ID:** `expiry-warning`  
**Trigger:** Cron (daily at 9 AM)  
**Frequency:** Daily

#### Flow Diagram
```
Cron Trigger (9 AM)
  ↓
Fetch All Shops
  ↓
For Each Shop:
  ├─ Query Products Expiring in 30 Days (API)
  ├─ IF: Products Found
  │   ├─ Create Alert Message
  │   └─ Send WhatsApp
  └─ Log Warning
  ↓
End
```

#### Configuration

**Expiry Threshold:** 30 days

**WhatsApp Message:**
```
⚠️ *Expiry Alert*

The following products are expiring soon:

1. {{product_1}} - Expires: {{date_1}}
2. {{product_2}} - Expires: {{date_2}}

Take action to avoid wastage!
```

---

### 6. Weekly Summary Workflow

**Workflow ID:** `weekly-summary`  
**Trigger:** Cron (Sunday 8 PM)  
**Frequency:** Weekly

#### Key Metrics:
- Total sales for the week
- Week-over-week growth
- Best-selling products
- Slow-moving items
- Profit estimate

**Channels:** WhatsApp + Email (PDF)

---

### 7. Out of Stock Alert

**Workflow ID:** `out-of-stock`  
**Trigger:** Webhook (inventory = 0)  
**Frequency:** Real-time

**Priority:** Critical

**Actions:**
1. WhatsApp alert
2. SMS alert
3. Email to owner
4. Auto-create restock order (if enabled)

---

## Custom Workflows

### Creating Custom Workflows

1. **Access n8n Dashboard**
   - Navigate to workflows section
   - Click "Create New Workflow"

2. **Choose Trigger**
   - Webhook (for real-time events)
   - Cron (for scheduled tasks)
   - Manual (for testing)

3. **Add Nodes**
   - Drag and drop from node library
   - Connect nodes with logic flow

4. **Configure Credentials**
   - Add API keys, tokens
   - Test connections

5. **Test Workflow**
   - Use test data
   - Verify all nodes execute correctly

6. **Activate**
   - Toggle "Active" switch
   - Monitor execution logs

---

### Example: Custom Festival Alert

**Use Case:** Send special message on Diwali

**Nodes:**
1. Cron Trigger (Oct 24, 8 AM)
2. Fetch All Shops
3. Create Festival Message
4. Send WhatsApp
5. Log Sent

**Message:**
```
🪔 *Happy Diwali!*

Wishing you and your business prosperity!

Special Tip: Stock up on sweets, decorations, 
and gift items for the festive rush! 🎁
```

---

## Monitoring & Debugging

### 1. Execution Logs

**Access:** n8n Dashboard → Executions

**View:**
- Execution time
- Success/failure status
- Node-by-node data
- Error messages

**Retention:** 30 days (configurable)

---

### 2. Error Handling

**Retry Settings:**
```json
{
  "retry_on_fail": true,
  "max_tries": 3,
  "wait_between_tries": 60000
}
```

**Error Notification:**
- Slack/Email on workflow failure
- Webhook to monitoring service

---

### 3. Performance Monitoring

**Metrics:**
- Execution time per workflow
- Success rate
- Node performance

**Optimization:**
- Batch processing for large datasets
- Async execution where possible
- Cache frequently accessed data

---

### 4. Testing Workflows

**Test Mode:**
1. Use "Test Workflow" button
2. Provide sample data
3. Verify output at each node

**Manual Trigger:**
- For scheduled workflows
- Test before activating

---

## Best Practices

### 1. Workflow Design
- ✅ Keep workflows focused (single responsibility)
- ✅ Use descriptive node names
- ✅ Add notes for complex logic
- ✅ Handle errors gracefully
- ✅ Log important events

### 2. Performance
- ✅ Batch API requests where possible
- ✅ Use filters early to reduce processing
- ✅ Cache static data
- ✅ Set appropriate timeouts

### 3. Security
- ✅ Use environment variables for secrets
- ✅ Rotate API keys regularly
- ✅ Limit webhook access (IP whitelist)
- ✅ Encrypt sensitive data

### 4. Maintenance
- ✅ Review execution logs weekly
- ✅ Update credentials before expiry
- ✅ Document custom workflows
- ✅ Test after any changes

---

## Workflow Library

### Pre-built Templates (JSON)

All workflow JSON files available at:
`/workspace/n8n-workflows/`

**Files:**
- `low-stock-alert.json`
- `daily-sales-report.json`
- `restock-order.json`
- `high-sales-alert.json`
- `expiry-warning.json`
- `weekly-summary.json`
- `out-of-stock.json`

**Import Instructions:**
1. Download JSON file
2. n8n → Import from File
3. Configure credentials
4. Test and activate

---

## Support & Troubleshooting

### Common Issues

**Issue 1: Webhook not triggering**
- ✅ Check webhook URL is correct
- ✅ Verify API is sending POST requests
- ✅ Check n8n is running

**Issue 2: WhatsApp message not sending**
- ✅ Verify WhatsApp API credentials
- ✅ Check phone number format (+91...)
- ✅ Ensure WhatsApp Business account is active

**Issue 3: Workflow execution slow**
- ✅ Optimize API calls (batch requests)
- ✅ Remove unnecessary nodes
- ✅ Check internet connectivity

**Issue 4: Error in Code node**
- ✅ Check JavaScript syntax
- ✅ Verify data structure
- ✅ Add try-catch blocks

---

### Getting Help

- **n8n Documentation:** https://docs.n8n.io
- **n8n Community:** https://community.n8n.io
- **Stock Line Support:** support@stockline.app

---

**Document Owner:** Automation Team, Stock Line  
**Last Updated:** 2025-10-10  
**Next Review:** Monthly
