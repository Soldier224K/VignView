const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { 
  createShop, 
  getDocument, 
  getCollection, 
  updateDocument, 
  deleteDocument 
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
const shopSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  category: Joi.string().valid(
    'grocery', 'pharmacy', 'clothing', 'stationery', 
    'hardware', 'paints', 'electronics', 'books', 'other'
  ).required(),
  address: Joi.string().min(10).max(500).required(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().min(2).max(50).required(),
  pincode: Joi.string().pattern(/^[0-9]{6}$/).required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  email: Joi.string().email().optional(),
  gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  description: Joi.string().max(500).optional()
});

// Create new shop
router.post('/', verifyToken, async (req, res) => {
  try {
    const { error, value } = shopSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user already has a shop
    const shopsRef = getCollection('shops');
    const existingShop = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (!existingShop.empty) {
      return res.status(400).json({ error: 'User already has a shop registered' });
    }

    const shopData = {
      ...value,
      ownerId: req.userId,
      isActive: true,
      totalProducts: 0,
      totalSales: 0,
      lastStockUpdate: null
    };

    const shop = await createShop(shopData);

    res.status(201).json({
      message: 'Shop created successfully',
      shop
    });

  } catch (error) {
    console.error('Shop creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's shop
router.get('/my-shop', verifyToken, async (req, res) => {
  try {
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopDoc = shopQuery.docs[0];
    const shop = { id: shopDoc.id, ...shopDoc.data() };

    res.json({ shop });

  } catch (error) {
    console.error('Shop fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get shop by ID
router.get('/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await getDocument('shops', shopId);
    
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Remove sensitive information for public access
    delete shop.ownerId;
    delete shop.gstNumber;

    res.json({ shop });

  } catch (error) {
    console.error('Shop fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update shop
router.put('/:shopId', verifyToken, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { error, value } = shopSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if shop exists and belongs to user
    const shop = await getDocument('shops', shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (shop.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this shop' });
    }

    const updatedShop = await updateDocument('shops', shopId, value);

    res.json({
      message: 'Shop updated successfully',
      shop: updatedShop
    });

  } catch (error) {
    console.error('Shop update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete shop
router.delete('/:shopId', verifyToken, async (req, res) => {
  try {
    const { shopId } = req.params;

    // Check if shop exists and belongs to user
    const shop = await getDocument('shops', shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (shop.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this shop' });
    }

    // Soft delete - mark as inactive
    await updateDocument('shops', shopId, { isActive: false });

    res.json({ message: 'Shop deleted successfully' });

  } catch (error) {
    console.error('Shop delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get shop statistics
router.get('/:shopId/stats', verifyToken, async (req, res) => {
  try {
    const { shopId } = req.params;

    // Check if shop exists and belongs to user
    const shop = await getDocument('shops', shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (shop.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to view this shop' });
    }

    // Get inventory count
    const inventoryRef = getCollection('inventory');
    const inventoryQuery = await inventoryRef.where('shopId', '==', shopId).get();
    const totalProducts = inventoryQuery.size;

    // Get sales count for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const salesRef = getCollection('sales');
    const salesQuery = await salesRef
      .where('shopId', '==', shopId)
      .where('createdAt', '>=', currentMonth)
      .get();
    
    const monthlySales = salesQuery.size;
    const monthlyRevenue = salesQuery.docs.reduce((total, doc) => {
      const sale = doc.data();
      return total + (sale.totalAmount || 0);
    }, 0);

    // Get low stock items
    const lowStockQuery = await inventoryRef
      .where('shopId', '==', shopId)
      .where('currentStock', '<=', 5)
      .get();
    
    const lowStockItems = lowStockQuery.size;

    const stats = {
      totalProducts,
      monthlySales,
      monthlyRevenue,
      lowStockItems,
      lastStockUpdate: shop.lastStockUpdate
    };

    res.json({ stats });

  } catch (error) {
    console.error('Shop stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search shops by category and location
router.get('/search', async (req, res) => {
  try {
    const { category, city, state, limit = 20 } = req.query;
    
    let query = getCollection('shops').where('isActive', '==', true);
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (city) {
      query = query.where('city', '==', city);
    }
    
    if (state) {
      query = query.where('state', '==', state);
    }

    const snapshot = await query.limit(parseInt(limit)).get();
    const shops = snapshot.docs.map(doc => {
      const shop = { id: doc.id, ...doc.data() };
      // Remove sensitive information
      delete shop.ownerId;
      delete shop.gstNumber;
      return shop;
    });

    res.json({ shops });

  } catch (error) {
    console.error('Shop search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;