const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { 
  createAlert, 
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
const alertSchema = Joi.object({
  type: Joi.string().valid(
    'low_stock', 'out_of_stock', 'high_demand', 'weather_alert', 
    'restock_reminder', 'custom', 'system'
  ).required(),
  title: Joi.string().min(1).max(100).required(),
  message: Joi.string().min(1).max(500).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  data: Joi.object().optional()
});

// Create new alert
router.post('/', verifyToken, async (req, res) => {
  try {
    const { error, value } = alertSchema.validate(req.body);
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

    const alertData = {
      ...value,
      shopId,
      status: 'active',
      isRead: false,
      createdBy: req.userId
    };

    const alert = await createAlert(alertData);

    res.status(201).json({
      message: 'Alert created successfully',
      alert
    });

  } catch (error) {
    console.error('Alert creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all alerts for user's shop
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
      type, 
      status, 
      priority, 
      isRead, 
      limit = 50, 
      page = 1 
    } = req.query;

    let query = getCollection('alerts')
      .where('shopId', '==', shopId)
      .orderBy('createdAt', 'desc');

    if (type) {
      query = query.where('type', '==', type);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    if (priority) {
      query = query.where('priority', '==', priority);
    }

    if (isRead !== undefined) {
      query = query.where('isRead', '==', isRead === 'true');
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const snapshot = await query.limit(parseInt(limit)).offset(offset).get();
    
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ alerts });

  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single alert
router.get('/:alertId', verifyToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await getDocument('alerts', alertId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Check if alert belongs to user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty || alert.shopId !== shopQuery.docs[0].id) {
      return res.status(403).json({ error: 'Not authorized to view this alert' });
    }

    res.json({ alert });

  } catch (error) {
    console.error('Alert fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark alert as read
router.put('/:alertId/read', verifyToken, async (req, res) => {
  try {
    const { alertId } = req.params;

    // Check if alert exists and belongs to user's shop
    const alert = await getDocument('alerts', alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty || alert.shopId !== shopQuery.docs[0].id) {
      return res.status(403).json({ error: 'Not authorized to update this alert' });
    }

    const updatedAlert = await updateDocument('alerts', alertId, { 
      isRead: true,
      readAt: new Date()
    });

    res.json({
      message: 'Alert marked as read',
      alert: updatedAlert
    });

  } catch (error) {
    console.error('Alert read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all alerts as read
router.put('/mark-all-read', verifyToken, async (req, res) => {
  try {
    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;

    // Get all unread alerts
    const alertsRef = getCollection('alerts');
    const unreadQuery = await alertsRef
      .where('shopId', '==', shopId)
      .where('isRead', '==', false)
      .get();

    // Update all unread alerts
    const batch = [];
    unreadQuery.docs.forEach(doc => {
      batch.push(updateDocument('alerts', doc.id, { 
        isRead: true,
        readAt: new Date()
      }));
    });

    await Promise.all(batch);

    res.json({
      message: 'All alerts marked as read',
      updatedCount: unreadQuery.size
    });

  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update alert status
router.put('/:alertId/status', verifyToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    // Check if alert exists and belongs to user's shop
    const alert = await getDocument('alerts', alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty || alert.shopId !== shopQuery.docs[0].id) {
      return res.status(403).json({ error: 'Not authorized to update this alert' });
    }

    const updateData = { status };
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const updatedAlert = await updateDocument('alerts', alertId, updateData);

    res.json({
      message: 'Alert status updated successfully',
      alert: updatedAlert
    });

  } catch (error) {
    console.error('Alert status update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete alert
router.delete('/:alertId', verifyToken, async (req, res) => {
  try {
    const { alertId } = req.params;

    // Check if alert exists and belongs to user's shop
    const alert = await getDocument('alerts', alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty || alert.shopId !== shopQuery.docs[0].id) {
      return res.status(403).json({ error: 'Not authorized to delete this alert' });
    }

    // Soft delete - mark as dismissed
    await updateDocument('alerts', alertId, { 
      status: 'dismissed',
      dismissedAt: new Date()
    });

    res.json({ message: 'Alert deleted successfully' });

  } catch (error) {
    console.error('Alert delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get alert statistics
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    // Get user's shop
    const shopsRef = getCollection('shops');
    const shopQuery = await shopsRef.where('ownerId', '==', req.userId).get();
    
    if (shopQuery.empty) {
      return res.status(404).json({ error: 'No shop found for this user' });
    }

    const shopId = shopQuery.docs[0].id;

    // Get all alerts for the shop
    const alertsRef = getCollection('alerts');
    const alertsQuery = await alertsRef.where('shopId', '==', shopId).get();
    
    const alerts = alertsQuery.docs.map(doc => doc.data());

    // Calculate statistics
    const totalAlerts = alerts.length;
    const unreadAlerts = alerts.filter(alert => !alert.isRead).length;
    const activeAlerts = alerts.filter(alert => alert.status === 'active').length;
    const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved').length;

    // Alerts by type
    const alertsByType = alerts.reduce((acc, alert) => {
      const type = alert.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Alerts by priority
    const alertsByPriority = alerts.reduce((acc, alert) => {
      const priority = alert.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    // Recent alerts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAlerts = alerts.filter(alert => 
      new Date(alert.createdAt) >= sevenDaysAgo
    ).length;

    const stats = {
      totalAlerts,
      unreadAlerts,
      activeAlerts,
      resolvedAlerts,
      recentAlerts,
      alertsByType,
      alertsByPriority
    };

    res.json({ stats });

  } catch (error) {
    console.error('Alert stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;