const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { 
  createInventoryItem, 
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
const inventoryItemSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  category: Joi.string().min(1).max(50).required(),
  currentStock: Joi.number().min(0).required(),
  minStock: Joi.number().min(0).required(),
  maxStock: Joi.number().min(0).required(),
  unit: Joi.string().valid('pieces', 'kg', 'liters', 'boxes', 'packets', 'bottles', 'other').required(),
  price: Joi.number().min(0).optional(),
  costPrice: Joi.number().min(0).optional(),
  barcode: Joi.string().optional(),
  description: Joi.string().max(500).optional(),
  imageUrl: Joi.string().uri().optional()
});

const bulkUpdateSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      currentStock: Joi.number().min(0).required(),
      price: Joi.number().min(0).optional()
    })
  ).min(1).required()
});

// Add new inventory item
router.post('/', verifyToken, async (req, res) => {
  try {
    const { error, value } = inventoryItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shop = shopQuery.docs[0].data();
    const shopId = shopQuery.docs[0].id;

    const itemData = {
      ...value,
      shopId,
      isActive: true,
      lastUpdated: new Date(),
      totalSold: 0,
      lastRestocked: null
    };

    const item = await createInventoryItem(itemData);

    // Update shop's total products count
    await updateDocument('shops', shopId, { 
      totalProducts: shop.totalProducts + 1,
      lastStockUpdate: new Date()
    });

    res.status(201).json({
      message: 'Inventory item added successfully',
      item
    });

  } catch (error) {
    console.error('Inventory creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all inventory items for user's shop
router.get('/', verifyToken, async (req, res) => {
  try {
    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;
    const { category, lowStock, limit = 50 } = req.query;

    let query = getCollection('inventory')
      .where('shopId', '==', shopId)
      .where('isActive', '==', true);

    if (category) {
      query = query.where('category', '==', category);
    }

    if (lowStock === 'true') {
      // This will be handled after fetching all items
    }

    const snapshot = await query.limit(parseInt(limit)).get();
    let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter low stock items if requested
    if (lowStock === 'true') {
      items = items.filter(item => item.currentStock <= item.minStock);
    }

    res.json({ items });

  } catch (error) {
    console.error('Inventory fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single inventory item
router.get('/:itemId', verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await getDocument('inventory', itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Check if item belongs to user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty || item.shopId !== shopQuery.docs[0].id) {
      return res.status(403).json({ error: 'Not authorized to view this item' });
    }

    res.json({ item });

  } catch (error) {
    console.error('Inventory item fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update inventory item
router.put('/:itemId', verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { error, value } = inventoryItemSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if item exists and belongs to user's shop
    const item = await getDocument('inventory', itemId);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty || item.shopId !== shopQuery.docs[0].id) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    const updatedItem = await updateDocument('inventory', itemId, {
      ...value,
      lastUpdated: new Date()
    });

    res.json({
      message: 'Inventory item updated successfully',
      item: updatedItem
    });

  } catch (error) {
    console.error('Inventory update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete inventory item
router.delete('/:itemId', verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    // Check if item exists and belongs to user's shop
    const item = await getDocument('inventory', itemId);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty || item.shopId !== shopQuery.docs[0].id) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    // Soft delete
    await updateDocument('inventory', itemId, { isActive: false });

    res.json({ message: 'Inventory item deleted successfully' });

  } catch (error) {
    console.error('Inventory delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk update inventory
router.put('/bulk-update', verifyToken, async (req, res) => {
  try {
    const { error, value } = bulkUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { items } = value;
    const updatedItems = [];

    for (const itemUpdate of items) {
      const item = await getDocument('inventory', itemUpdate.id);
      
      if (item) {
        // Check if item belongs to user's shop
        const shopsRef = getCollection('shops');
        const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
        
        if (!shopQuery.empty && item.shopId === shopQuery.docs[0].id) {
          const updateData = {
            currentStock: itemUpdate.currentStock,
            lastUpdated: new Date()
          };
          
          if (itemUpdate.price !== undefined) {
            updateData.price = itemUpdate.price;
          }

          const updatedItem = await updateDocument('inventory', itemUpdate.id, updateData);
          updatedItems.push(updatedItem);
        }
      }
    }

    res.json({
      message: 'Bulk update completed',
      updatedCount: updatedItems.length,
      items: updatedItems
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analyze image for product detection
router.post('/analyze-image', verifyToken, async (req, res) => {
  try {
    const { imageData, shopCategory } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Call ML service for image analysis
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    const response = await axios.post(`${mlServiceUrl}/analyze-image`, {
      image_data: imageData,
      shop_category: shopCategory || 'grocery'
    });

    res.json({
      message: 'Image analysis completed',
      detections: response.data.detections,
      totalProducts: response.data.total_products
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

// Upload image for analysis
router.post('/upload-image', verifyToken, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get user's shop category
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shop = shopQuery.docs[0].data();
    const shopCategory = shop.category;

    // Convert image to base64
    const imageData = req.file.buffer.toString('base64');

    // Call ML service for image analysis
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    const response = await axios.post(`${mlServiceUrl}/upload-image`, {
      image_data: imageData,
      shop_category: shopCategory
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      message: 'Image uploaded and analyzed successfully',
      filename: req.file.filename,
      detections: response.data.detections,
      totalProducts: response.data.total_products
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// Get low stock alerts
router.get('/alerts/low-stock', verifyToken, async (req, res) => {
  try {
    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;

    // Get low stock items
    const inventoryRef = getCollection('inventory');
    const lowStockQuery = await inventoryRef
      .where('shopId', '==', shopId)
      .where('isActive', '==', true)
      .get();

    const lowStockItems = lowStockQuery.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.currentStock <= item.minStock);

    res.json({
      lowStockItems,
      count: lowStockItems.length
    });

  } catch (error) {
    console.error('Low stock alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;