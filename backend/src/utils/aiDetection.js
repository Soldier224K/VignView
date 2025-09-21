const axios = require('axios');
const logger = require('./logger');

// AI Service Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

/**
 * Analyze image with AI to detect civic issues
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} - AI detection results
 */
const analyzeImageWithAI = async (imageBuffer) => {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Call AI service
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      image: base64Image,
      model: 'issue-detection'
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    return response.data;
  } catch (error) {
    logger.error('AI detection error:', error);
    
    // Return fallback detection results
    return {
      detected_issues: [],
      confidence: 0,
      processing_time: 0,
      error: 'AI service unavailable'
    };
  }
};

/**
 * Detect specific issue types in image
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} issueType - Type of issue to detect
 * @returns {Promise<Object>} - Detection results for specific issue type
 */
const detectSpecificIssue = async (imageBuffer, issueType) => {
  try {
    const base64Image = imageBuffer.toString('base64');
    
    const response = await axios.post(`${AI_SERVICE_URL}/detect`, {
      image: base64Image,
      issue_type: issueType
    }, {
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    logger.error(`AI detection error for ${issueType}:`, error);
    return {
      detected: false,
      confidence: 0,
      bounding_boxes: [],
      error: 'AI service unavailable'
    };
  }
};

/**
 * Batch analyze multiple images
 * @param {Array<Buffer>} imageBuffers - Array of image buffers
 * @returns {Promise<Array>} - Array of detection results
 */
const batchAnalyzeImages = async (imageBuffers) => {
  try {
    const base64Images = imageBuffers.map(buffer => buffer.toString('base64'));
    
    const response = await axios.post(`${AI_SERVICE_URL}/batch-analyze`, {
      images: base64Images,
      model: 'issue-detection'
    }, {
      timeout: 60000 // 60 second timeout for batch processing
    });
    
    return response.data;
  } catch (error) {
    logger.error('Batch AI detection error:', error);
    return imageBuffers.map(() => ({
      detected_issues: [],
      confidence: 0,
      processing_time: 0,
      error: 'AI service unavailable'
    }));
  }
};

/**
 * Get AI model status and health
 * @returns {Promise<Object>} - Model status information
 */
const getAIModelStatus = async () => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/status`, {
      timeout: 5000
    });
    
    return response.data;
  } catch (error) {
    logger.error('AI model status check error:', error);
    return {
      status: 'offline',
      models: [],
      error: 'AI service unavailable'
    };
  }
};

/**
 * Retrain AI model with new data
 * @param {Array} trainingData - Training data
 * @returns {Promise<Object>} - Training results
 */
const retrainModel = async (trainingData) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/retrain`, {
      training_data: trainingData,
      model_name: 'issue-detection'
    }, {
      timeout: 300000 // 5 minute timeout for training
    });
    
    return response.data;
  } catch (error) {
    logger.error('Model retraining error:', error);
    throw error;
  }
};

/**
 * Validate AI detection results
 * @param {Object} results - AI detection results
 * @returns {Object} - Validated and cleaned results
 */
const validateDetectionResults = (results) => {
  const validatedResults = {
    detected_issues: [],
    confidence: 0,
    processing_time: 0,
    timestamp: new Date().toISOString()
  };
  
  if (results && typeof results === 'object') {
    // Validate detected issues
    if (Array.isArray(results.detected_issues)) {
      validatedResults.detected_issues = results.detected_issues.filter(issue => {
        return issue && 
               typeof issue.type === 'string' && 
               typeof issue.confidence === 'number' &&
               issue.confidence >= 0 && 
               issue.confidence <= 1;
      });
    }
    
    // Validate confidence score
    if (typeof results.confidence === 'number') {
      validatedResults.confidence = Math.max(0, Math.min(1, results.confidence));
    }
    
    // Validate processing time
    if (typeof results.processing_time === 'number') {
      validatedResults.processing_time = Math.max(0, results.processing_time);
    }
  }
  
  return validatedResults;
};

/**
 * Categorize detected issues by type
 * @param {Array} detectedIssues - Array of detected issues
 * @returns {Object} - Categorized issues
 */
const categorizeDetectedIssues = (detectedIssues) => {
  const categories = {
    pothole: [],
    garbage: [],
    sewage: [],
    street_light: [],
    traffic_signal: [],
    road_damage: [],
    water_leak: [],
    illegal_dumping: [],
    other: []
  };
  
  detectedIssues.forEach(issue => {
    const category = issue.type.toLowerCase().replace(/\s+/g, '_');
    if (categories[category]) {
      categories[category].push(issue);
    } else {
      categories.other.push(issue);
    }
  });
  
  return categories;
};

/**
 * Calculate overall issue severity score
 * @param {Array} detectedIssues - Array of detected issues
 * @returns {number} - Severity score (0-1)
 */
const calculateSeverityScore = (detectedIssues) => {
  if (!Array.isArray(detectedIssues) || detectedIssues.length === 0) {
    return 0;
  }
  
  const severityWeights = {
    pothole: 0.8,
    sewage: 0.9,
    water_leak: 0.7,
    traffic_signal: 0.6,
    street_light: 0.4,
    garbage: 0.5,
    illegal_dumping: 0.6,
    road_damage: 0.7,
    other: 0.3
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  detectedIssues.forEach(issue => {
    const weight = severityWeights[issue.type] || severityWeights.other;
    totalScore += issue.confidence * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

module.exports = {
  analyzeImageWithAI,
  detectSpecificIssue,
  batchAnalyzeImages,
  getAIModelStatus,
  retrainModel,
  validateDetectionResults,
  categorizeDetectedIssues,
  calculateSeverityScore
};