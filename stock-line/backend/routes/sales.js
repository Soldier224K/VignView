const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { 
  createSale, 
  getDocument, 
  getCollection, 
  updateDocument 
} = require('../services/firebase');

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Validation schemas
const saleItemSchema = Joi.object({
  itemId: Joi.string().required(),
  itemName: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  unitPrice: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required()
});

const saleSchema = Joi.object({
  customerName: Joi.string().min(1).max(100).optional(),
  customerPhone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  items: Joi.array().items(saleItemSchema).min(1).required(),
  subtotal: Joi.number().min(0).required(),
  discount: Joi.number().min(0).optional(),
  tax: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'other').required(),
  notes: Joi.string().max(500).optional()
});

// Create new sale
router.post('/', verifyToken, async (req, res) => {
  try {
    const { error, value } = saleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;
    const shop = shopQuery.docs[0].data();

    // Validate inventory and update stock
    const inventoryUpdates = [];
    for (const item of value.items) {
      const inventoryItem = await getDocument('inventory', item.itemId);
      
      if (!inventoryItem) {
        return res.status(400).json({ error: `Item ${item.itemName} not found in inventory` });
      }

      if (inventoryItem.currentStock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.itemName}. Available: ${inventoryItem.currentStock}` 
        });
      }

      // Prepare inventory update
      inventoryUpdates.push({
        id: item.itemId,
        newStock: inventoryItem.currentStock - item.quantity,
        totalSold: inventoryItem.totalSold + item.quantity
      });
    }

    // Create sale record
    const saleData = {
      ...value,
      shopId,
      saleNumber: `SL-${Date.now()}`,
      status: 'completed',
      createdAt: new Date()
    };

    const sale = await createSale(saleData);

    // Update inventory items
    for (const update of inventoryUpdates) {
      await updateDocument('inventory', update.id, {
        currentStock: update.newStock,
        totalSold: update.totalSold,
        lastUpdated: new Date()
      });
    }

    // Update shop's total sales
    await updateDocument('shops', shopId, {
      totalSales: shop.totalSales + 1,
      lastStockUpdate: new Date()
    });

    res.status(201).json({
      message: 'Sale completed successfully',
      sale
    });

  } catch (error) {
    console.error('Sale creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all sales for user's shop
router.get('/', verifyToken, async (req, res) => {
  try {
    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;
    const { 
      startDate, 
      endDate, 
      paymentMethod, 
      limit = 50,
      page = 1 
    } = req.query;

    let query = getCollection('sales')
      .where('shopId', '==', shopId)
      .orderBy('createdAt', 'desc');

    if (startDate) {
      const start = new Date(startDate);
      query = query.where('createdAt', '>=', start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.where('createdAt', '<=', end);
    }

    if (paymentMethod) {
      query = query.where('paymentMethod', '==', paymentMethod);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const snapshot = await query.limit(parseInt(limit)).offset(offset).get();
    
    const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ sales });

  } catch (error) {
    console.error('Sales fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single sale
router.get('/:saleId', verifyToken, async (req, res) => {
  try {
    const { saleId } = req.params;
    const sale = await getDocument('sales', saleId);
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Check if sale belongs to user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty || sale.shopId !== shopQuery.docs[0].id) {
      return res.status(403).json({ error: 'Not authorized to view this sale' });
    }

    res.json({ sale });

  } catch (error) {
    console.error('Sale fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sales statistics
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;
    const { period = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get sales for the period
    const salesRef = getCollection('sales');
    const salesQuery = await salesRef
      .where('shopId', '==', shopId)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', now)
      .get();

    const sales = salesQuery.docs.map(doc => doc.data());

    // Calculate statistics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Payment method breakdown
    const paymentMethods = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Top selling items
    const itemSales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.itemName;
        if (!itemSales[key]) {
          itemSales[key] = { quantity: 0, revenue: 0 };
        }
        itemSales[key].quantity += item.quantity;
        itemSales[key].revenue += item.totalPrice;
      });
    });

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const stats = {
      period,
      totalSales,
      totalRevenue,
      averageOrderValue,
      paymentMethods,
      topItems
    };

    res.json({ stats });

  } catch (error) {
    console.error('Sales stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate sales report
router.post('/report', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;

    // Get sales in date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const salesRef = getCollection('sales');
    const salesQuery = await salesRef
      .where('shopId', '==', shopId)
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .orderBy('createdAt', 'desc')
      .get();

    const sales = salesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate report data
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalItems = sales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    const report = {
      period: { startDate, endDate },
      summary: {
        totalSales,
        totalRevenue,
        totalItems,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0
      },
      sales
    };

    if (format === 'csv') {
      // Generate CSV format
      const csvHeader = 'Sale Number,Date,Customer,Items,Total Amount,Payment Method\n';
      const csvRows = sales.map(sale => {
        const date = new Date(sale.createdAt).toLocaleDateString();
        const items = sale.items.map(item => `${item.itemName}(${item.quantity})`).join('; ');
        return `${sale.saleNumber},${date},"${sale.customerName || ''}",${items},${sale.totalAmount},${sale.paymentMethod}`;
      }).join('\n');
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="sales-report-${startDate}-to-${endDate}.csv"`);
      res.send(csv);
    } else {
      res.json({ report });
    }

  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;