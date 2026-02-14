const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { 
  createReport, 
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
const reportRequestSchema = Joi.object({
  type: Joi.string().valid('stock', 'sales', 'forecast', 'weather').required(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  format: Joi.string().valid('json', 'pdf', 'excel').default('json')
});

// Generate stock report
router.post('/stock', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.body;

    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;
    const shop = shopQuery.docs[0].data();

    // Get inventory items
    const inventoryRef = getCollection('inventory');
    const inventoryQuery = await inventoryRef
      .where('shopId', '==', shopId)
      .where('isActive', '==', true)
      .get();

    const items = inventoryQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate stock statistics
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * (item.price || 0)), 0);
    const lowStockItems = items.filter(item => item.currentStock <= item.minStock);
    const outOfStockItems = items.filter(item => item.currentStock === 0);

    // Categorize items
    const categories = items.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0, items: [] };
      }
      acc[category].count += 1;
      acc[category].value += item.currentStock * (item.price || 0);
      acc[category].items.push(item);
      return acc;
    }, {});

    const report = {
      shop: {
        name: shop.name,
        category: shop.category,
        address: shop.address
      },
      generatedAt: new Date(),
      summary: {
        totalItems,
        totalValue,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length
      },
      categories,
      lowStockItems,
      outOfStockItems,
      allItems: items
    };

    // Save report to database
    await createReport({
      shopId,
      type: 'stock',
      title: 'Stock Report',
      data: report,
      generatedBy: req.userId
    });

    if (format === 'json') {
      res.json({ report });
    } else {
      // For PDF/Excel, you would integrate with libraries like puppeteer or exceljs
      res.json({ 
        message: 'Report generated successfully',
        reportId: report.id,
        note: 'PDF/Excel export coming soon'
      });
    }

  } catch (error) {
    console.error('Stock report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate sales report
router.post('/sales', verifyToken, async (req, res) => {
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
    const shop = shopQuery.docs[0].data();

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

    // Calculate sales statistics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalItems = sales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    // Daily breakdown
    const dailySales = sales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0, items: 0 };
      }
      acc[date].count += 1;
      acc[date].revenue += sale.totalAmount || 0;
      acc[date].items += sale.items.reduce((sum, item) => sum + item.quantity, 0);
      return acc;
    }, {});

    // Top selling items
    const itemSales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.itemName;
        if (!itemSales[key]) {
          itemSales[key] = { quantity: 0, revenue: 0, sales: 0 };
        }
        itemSales[key].quantity += item.quantity;
        itemSales[key].revenue += item.totalPrice;
        itemSales[key].sales += 1;
      });
    });

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 20);

    // Payment method breakdown
    const paymentMethods = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'unknown';
      if (!acc[method]) {
        acc[method] = { count: 0, revenue: 0 };
      }
      acc[method].count += 1;
      acc[method].revenue += sale.totalAmount || 0;
      return acc;
    }, {});

    const report = {
      shop: {
        name: shop.name,
        category: shop.category,
        address: shop.address
      },
      period: { startDate, endDate },
      generatedAt: new Date(),
      summary: {
        totalSales,
        totalRevenue,
        totalItems,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0
      },
      dailySales,
      topItems,
      paymentMethods,
      allSales: sales
    };

    // Save report to database
    await createReport({
      shopId,
      type: 'sales',
      title: 'Sales Report',
      data: report,
      generatedBy: req.userId
    });

    if (format === 'json') {
      res.json({ report });
    } else {
      res.json({ 
        message: 'Report generated successfully',
        reportId: report.id,
        note: 'PDF/Excel export coming soon'
      });
    }

  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate forecast report
router.post('/forecast', verifyToken, async (req, res) => {
  try {
    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;
    const shop = shopQuery.docs[0].data();

    // Get inventory items
    const inventoryRef = getCollection('inventory');
    const inventoryQuery = await inventoryRef
      .where('shopId', '==', shopId)
      .where('isActive', '==', true)
      .get();

    const items = inventoryQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get weather data for location
    const weatherData = await getWeatherData(shop.city, shop.state);

    // Call ML service for forecasting
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    const products = items.map(item => ({
      name: item.name,
      current_stock: item.currentStock,
      historical_sales: [] // In production, this would come from sales data
    }));

    const forecastResponse = await axios.post(`${mlServiceUrl}/batch-forecast`, {
      products,
      shop_category: shop.category,
      location: `${shop.city}, ${shop.state}`
    });

    const forecasts = forecastResponse.data.forecasts;

    // Categorize forecasts
    const restockRecommendations = forecasts.filter(f => f.restock_recommendation);
    const lowConfidenceForecasts = forecasts.filter(f => f.confidence < 0.7);

    const report = {
      shop: {
        name: shop.name,
        category: shop.category,
        location: `${shop.city}, ${shop.state}`
      },
      generatedAt: new Date(),
      weatherData,
      summary: {
        totalProducts: items.length,
        restockRecommendations: restockRecommendations.length,
        lowConfidenceForecasts: lowConfidenceForecasts.length
      },
      forecasts,
      restockRecommendations,
      lowConfidenceForecasts
    };

    // Save report to database
    await createReport({
      shopId,
      type: 'forecast',
      title: 'Demand Forecast Report',
      data: report,
      generatedBy: req.userId
    });

    res.json({ report });

  } catch (error) {
    console.error('Forecast report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weather data
async function getWeatherData(city, state) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    const location = `${city}, ${state}`;
    const url = `http://api.openweathermap.org/data/2.5/weather`;
    const params = {
      q: location,
      appid: apiKey,
      units: 'metric'
    };

    const response = await axios.get(url, { params, timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('Weather data fetch error:', error);
    return null;
  }
}

// Get all reports for user's shop
router.get('/', verifyToken, async (req, res) => {
  try {
    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;
    const { type, limit = 20, page = 1 } = req.query;

    let query = getCollection('reports')
      .where('shopId', '==', shopId)
      .orderBy('createdAt', 'desc');

    if (type) {
      query = query.where('type', '==', type);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const snapshot = await query.limit(parseInt(limit)).offset(offset).get();
    
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ reports });

  } catch (error) {
    console.error('Reports fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single report
router.get('/:reportId', verifyToken, async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await getDocument('reports', reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check if report belongs to user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty || report.shopId !== shopQuery.docs[0].id) {
      return res.status(403).json({ error: 'Not authorized to view this report' });
    }

    res.json({ report });

  } catch (error) {
    console.error('Report fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;