const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const { 
  createAlert, 
  getDocument, 
  getCollection, 
  updateDocument 
} = require('../services/firebase');

const router = express.Router();

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const whatsappNumber = process.env.WHATSAPP_PHONE_NUMBER;

// Validation schemas
const messageSchema = Joi.object({
  to: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  message: Joi.string().min(1).max(1600).required(),
  type: Joi.string().valid('text', 'template', 'alert').default('text')
});

// Send WhatsApp message
router.post('/send', async (req, res) => {
  try {
    const { error, value } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { to, message, type } = value;

    // Send message via Twilio WhatsApp API
    const messageData = {
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:+91${to}`,
      body: message
    };

    const twilioMessage = await client.messages.create(messageData);

    // Log the message
    await createAlert({
      type: 'whatsapp_sent',
      recipient: to,
      message,
      messageType: type,
      status: 'sent',
      twilioMessageId: twilioMessage.sid
    });

    res.json({
      message: 'WhatsApp message sent successfully',
      messageId: twilioMessage.sid,
      status: twilioMessage.status
    });

  } catch (error) {
    console.error('WhatsApp send error:', error);
    
    // Log failed message
    await createAlert({
      type: 'whatsapp_failed',
      recipient: req.body.to,
      message: req.body.message,
      messageType: req.body.type || 'text',
      status: 'failed',
      error: error.message
    });

    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

// Send low stock alert
router.post('/send-low-stock-alert', async (req, res) => {
  try {
    const { shopId, items } = req.body;

    if (!shopId || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Shop ID and items array are required' });
    }

    // Get shop details
    const shop = await getDocument('shops', shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Get shop owner's WhatsApp number
    const user = await getDocument('users', shop.ownerId);
    if (!user || !user.whatsappNumber) {
      return res.status(400).json({ error: 'Shop owner WhatsApp number not found' });
    }

    // Format low stock message
    const itemList = items.map(item => 
      `• ${item.name}: ${item.currentStock} ${item.unit} (Min: ${item.minStock})`
    ).join('\n');

    const message = `🚨 *LOW STOCK ALERT* 🚨\n\n` +
      `Shop: ${shop.name}\n` +
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Items running low:\n${itemList}\n\n` +
      `Please restock these items soon!\n\n` +
      `Reply with "RESTOCK" to confirm or "DONE" when completed.`;

    // Send WhatsApp message
    const messageData = {
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:+91${user.whatsappNumber}`,
      body: message
    };

    const twilioMessage = await client.messages.create(messageData);

    // Log the alert
    await createAlert({
      type: 'low_stock_alert',
      shopId,
      recipient: user.whatsappNumber,
      message,
      items,
      status: 'sent',
      twilioMessageId: twilioMessage.sid
    });

    res.json({
      message: 'Low stock alert sent successfully',
      messageId: twilioMessage.sid,
      itemsCount: items.length
    });

  } catch (error) {
    console.error('Low stock alert error:', error);
    res.status(500).json({ error: 'Failed to send low stock alert' });
  }
});

// Send weekly summary
router.post('/send-weekly-summary', async (req, res) => {
  try {
    const { shopId } = req.body;

    if (!shopId) {
      return res.status(400).json({ error: 'Shop ID is required' });
    }

    // Get shop details
    const shop = await getDocument('shops', shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Get shop owner's WhatsApp number
    const user = await getDocument('users', shop.ownerId);
    if (!user || !user.whatsappNumber) {
      return res.status(400).json({ error: 'Shop owner WhatsApp number not found' });
    }

    // Calculate date range for last week
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Get sales data for the week
    const salesRef = getCollection('sales');
    const salesQuery = await salesRef
      .where('shopId', '==', shopId)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    const sales = salesQuery.docs.map(doc => doc.data());

    // Get inventory data
    const inventoryRef = getCollection('inventory');
    const inventoryQuery = await inventoryRef
      .where('shopId', '==', shopId)
      .where('isActive', '==', true)
      .get();

    const items = inventoryQuery.docs.map(doc => doc.data());

    // Calculate statistics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const lowStockItems = items.filter(item => item.currentStock <= item.minStock);
    const outOfStockItems = items.filter(item => item.currentStock === 0);

    // Format weekly summary message
    const message = `📊 *WEEKLY SUMMARY* 📊\n\n` +
      `Shop: ${shop.name}\n` +
      `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n\n` +
      `📈 *Sales Performance:*\n` +
      `• Total Sales: ${totalSales}\n` +
      `• Total Revenue: ₹${totalRevenue.toFixed(2)}\n` +
      `• Average Order: ₹${totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : 0}\n\n` +
      `📦 *Inventory Status:*\n` +
      `• Total Products: ${items.length}\n` +
      `• Low Stock Items: ${lowStockItems.length}\n` +
      `• Out of Stock: ${outOfStockItems.length}\n\n` +
      `Keep up the great work! 🎉`;

    // Send WhatsApp message
    const messageData = {
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:+91${user.whatsappNumber}`,
      body: message
    };

    const twilioMessage = await client.messages.create(messageData);

    // Log the summary
    await createAlert({
      type: 'weekly_summary',
      shopId,
      recipient: user.whatsappNumber,
      message,
      data: {
        totalSales,
        totalRevenue,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length
      },
      status: 'sent',
      twilioMessageId: twilioMessage.sid
    });

    res.json({
      message: 'Weekly summary sent successfully',
      messageId: twilioMessage.sid,
      summary: {
        totalSales,
        totalRevenue,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length
      }
    });

  } catch (error) {
    console.error('Weekly summary error:', error);
    res.status(500).json({ error: 'Failed to send weekly summary' });
  }
});

// Handle incoming WhatsApp messages (webhook)
router.post('/webhook', async (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;

    // Extract phone number from WhatsApp format
    const phoneNumber = From.replace('whatsapp:', '').replace('+91', '');

    // Find user by WhatsApp number
    const usersRef = getCollection('users');
    const userQuery = await usersRef.where('whatsappNumber', '==', phoneNumber).get();
    
    if (userQuery.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userQuery.docs[0].data();
    const userId = userQuery.docs[0].id;

    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for user' });
    }

    const shopId = shopQuery.docs[0].id;
    const message = Body.trim().toUpperCase();

    // Process different message types
    let response = '';

    if (message === 'RESTOCK') {
      // Mark low stock items as acknowledged for restocking
      response = '✅ Restock request acknowledged. We will follow up soon!';
      
      await createAlert({
        type: 'restock_acknowledged',
        shopId,
        recipient: phoneNumber,
        message: 'Restock request acknowledged',
        status: 'acknowledged',
        twilioMessageId: MessageSid
      });

    } else if (message === 'DONE') {
      // Mark restocking as completed
      response = '✅ Restocking completed! Thank you for updating.';
      
      await createAlert({
        type: 'restock_completed',
        shopId,
        recipient: phoneNumber,
        message: 'Restocking completed',
        status: 'completed',
        twilioMessageId: MessageSid
      });

    } else if (message === 'STOCK' || message === 'CHECK STOCK') {
      // Send current stock status
      const inventoryRef = getCollection('inventory');
      const inventoryQuery = await inventoryRef
        .where('shopId', '==', shopId)
        .where('isActive', '==', true)
        .get();

      const items = inventoryQuery.docs.map(doc => doc.data());
      const lowStockItems = items.filter(item => item.currentStock <= item.minStock);

      if (lowStockItems.length > 0) {
        const itemList = lowStockItems.map(item => 
          `• ${item.name}: ${item.currentStock} ${item.unit}`
        ).join('\n');
        
        response = `📦 *Current Stock Status:*\n\nLow stock items:\n${itemList}`;
      } else {
        response = '✅ All items are well stocked!';
      }

    } else if (message === 'HELP') {
      // Send help message
      response = `🤖 *Stock Line Bot Commands:*\n\n` +
        `• STOCK - Check current stock status\n` +
        `• RESTOCK - Acknowledge restock request\n` +
        `• DONE - Mark restocking as completed\n` +
        `• HELP - Show this help message\n\n` +
        `Type any command to get started!`;

    } else {
      // Default response
      response = `Hi! I'm your Stock Line assistant. Type "HELP" to see available commands.`;
    }

    // Send response back to user
    const messageData = {
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:+91${phoneNumber}`,
      body: response
    };

    await client.messages.create(messageData);

    // Log the interaction
    await createAlert({
      type: 'whatsapp_received',
      shopId,
      recipient: phoneNumber,
      message: Body,
      response,
      status: 'responded',
      twilioMessageId: MessageSid
    });

    res.json({ status: 'success' });

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get message history
router.get('/history', async (req, res) => {
  try {
    const { shopId, limit = 50, page = 1 } = req.query;

    if (!shopId) {
      return res.status(400).json({ error: 'Shop ID is required' });
    }

    const alertsRef = getCollection('alerts');
    const query = alertsRef
      .where('shopId', '==', shopId)
      .where('type', 'in', ['whatsapp_sent', 'whatsapp_received', 'low_stock_alert', 'weekly_summary'])
      .orderBy('createdAt', 'desc');

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const snapshot = await query.limit(parseInt(limit)).offset(offset).get();
    
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ messages });

  } catch (error) {
    console.error('Message history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;