const express = require('express');
const multer = require('multer');
const { body, validationResult, query } = require('express-validator');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { authenticateToken, authenticateOptional, requireAnonymous } = require('../middleware/authMiddleware');
const { uploadToCloudStorage } = require('../utils/fileUpload');
const { analyzeImageWithAI } = require('../utils/aiDetection');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// Validation middleware
const validateIssueCreation = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').isIn(['pothole', 'garbage', 'sewage', 'street_light', 'traffic_signal', 'road_damage', 'water_leak', 'illegal_dumping', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address too long'),
  body('city').optional().trim().isLength({ max: 100 }).withMessage('City name too long'),
  body('state').optional().trim().isLength({ max: 100 }).withMessage('State name too long'),
  body('pincode').optional().isPostalCode('IN').withMessage('Invalid pincode')
];

// @route   GET /api/issues
// @desc    Get all issues with filters
// @access  Public
router.get('/', [
  query('category').optional().isIn(['pothole', 'garbage', 'sewage', 'street_light', 'traffic_signal', 'road_damage', 'water_leak', 'illegal_dumping', 'other']),
  query('status').optional().isIn(['reported', 'verified', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('city').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('sortBy').optional().isIn(['created_at', 'upvotes', 'priority', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], authenticateOptional, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const filters = {
      category: req.query.category,
      status: req.query.status,
      priority: req.query.priority,
      city: req.query.city,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'desc'
    };

    // Add bounds filter if provided
    if (req.query.bounds) {
      try {
        filters.bounds = JSON.parse(req.query.bounds);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bounds format'
        });
      }
    }

    const issues = await Issue.findAll(filters);

    res.json({
      success: true,
      data: {
        issues: issues.map(issue => issue.toJSON()),
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: issues.length
        }
      }
    });
  } catch (error) {
    logger.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/issues/nearby
// @desc    Get nearby issues
// @access  Public
router.get('/nearby', [
  query('latitude').isFloat({ min: -90, max: 90 }),
  query('longitude').isFloat({ min: -180, max: 180 }),
  query('radius').optional().isFloat({ min: 0.1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { latitude, longitude, radius = 1 } = req.query;
    const issues = await Issue.getNearbyIssues(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius)
    );

    res.json({
      success: true,
      data: {
        issues: issues.map(issue => issue.toJSON()),
        location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        radius: parseFloat(radius)
      }
    });
  } catch (error) {
    logger.error('Get nearby issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby issues',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/issues/:id
// @desc    Get issue by ID
// @access  Public
router.get('/:id', authenticateOptional, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: {
        issue: issue.toJSON()
      }
    });
  } catch (error) {
    logger.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/issues
// @desc    Create a new issue report
// @access  Private/Anonymous
router.post('/', validateIssueCreation, upload.array('media', 5), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let reporterId = null;
    let isAnonymous = false;
    let deviceId = null;

    // Handle authentication
    if (req.user) {
      reporterId = req.user.id;
    } else {
      // Anonymous reporting
      isAnonymous = true;
      deviceId = req.headers['x-device-id'];
      
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Device ID required for anonymous reporting'
        });
      }
    }

    // Upload media files
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudStorage(file, 'issues');
        mediaUrls.push(url);
      }
    }

    // AI Detection on first image (if available)
    let aiDetectionResults = null;
    if (req.files && req.files.length > 0) {
      const firstImage = req.files.find(file => file.mimetype.startsWith('image/'));
      if (firstImage) {
        try {
          aiDetectionResults = await analyzeImageWithAI(firstImage.buffer);
        } catch (aiError) {
          logger.warn('AI detection failed:', aiError);
          // Continue without AI results
        }
      }
    }

    // Create issue
    const issueData = {
      reporterId,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority || 'medium',
      latitude: parseFloat(req.body.latitude),
      longitude: parseFloat(req.body.longitude),
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      mediaUrls,
      aiDetectionResults,
      isAnonymous,
      deviceId
    };

    const issue = await Issue.create(issueData);

    // Award points to user (if not anonymous)
    if (reporterId) {
      await User.addPoints(
        reporterId,
        10, // Base points for reporting
        'issue_report',
        `Reported ${req.body.category} issue`,
        issue.id
      );
    }

    logger.info(`New issue reported: ${issue.id} by ${reporterId || 'anonymous'}`);

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: {
        issue: issue.toJSON()
      }
    });
  } catch (error) {
    logger.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create issue',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/issues/:id/upvote
// @desc    Upvote an issue
// @access  Private
router.post('/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user is trying to upvote their own issue
    if (issue.reporterId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot upvote your own issue'
      });
    }

    // Add upvote
    await Issue.upvote(issueId, userId);

    // Award points to issue reporter (if not anonymous)
    if (issue.reporterId) {
      await User.addPoints(
        issue.reporterId,
        2, // Points for receiving upvote
        'upvote_received',
        `Issue upvoted by another user`,
        issueId
      );
    }

    logger.info(`Issue ${issueId} upvoted by user ${userId}`);

    res.json({
      success: true,
      message: 'Issue upvoted successfully'
    });
  } catch (error) {
    logger.error('Upvote issue error:', error);
    
    if (error.message === 'User has already upvoted this issue') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upvote issue',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/issues/stats/overview
// @desc    Get issue statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.city) {
      filters.city = req.query.city;
    }
    if (req.query.dateFrom) {
      filters.dateFrom = req.query.dateFrom;
    }
    if (req.query.dateTo) {
      filters.dateTo = req.query.dateTo;
    }

    const stats = await Issue.getStats(filters);

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    logger.error('Get issue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;