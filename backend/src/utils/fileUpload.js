const AWS = require('aws-sdk');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure Google Cloud Storage
let gcs;
if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
  gcs = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
  });
}

/**
 * Upload file to cloud storage (AWS S3 or Google Cloud Storage)
 * @param {Object} file - Multer file object
 * @param {string} folder - Folder name in storage
 * @returns {Promise<string>} - Public URL of uploaded file
 */
const uploadToCloudStorage = async (file, folder = 'uploads') => {
  try {
    const fileExtension = getFileExtension(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;
    
    let buffer = file.buffer;
    
    // Process image files
    if (file.mimetype.startsWith('image/')) {
      buffer = await processImage(file.buffer);
    }
    
    // Choose storage provider
    if (process.env.AWS_S3_BUCKET) {
      return await uploadToS3(buffer, fileName, file.mimetype);
    } else if (process.env.GOOGLE_CLOUD_STORAGE_BUCKET) {
      return await uploadToGCS(buffer, fileName, file.mimetype);
    } else {
      throw new Error('No cloud storage configured');
    }
  } catch (error) {
    logger.error('File upload error:', error);
    throw error;
  }
};

/**
 * Upload file to AWS S3
 */
const uploadToS3 = async (buffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read'
  };
  
  const result = await s3.upload(params).promise();
  return result.Location;
};

/**
 * Upload file to Google Cloud Storage
 */
const uploadToGCS = async (buffer, fileName, mimeType) => {
  const bucket = gcs.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
  const file = bucket.file(fileName);
  
  await file.save(buffer, {
    metadata: {
      contentType: mimeType
    },
    public: true
  });
  
  return `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${fileName}`;
};

/**
 * Process image file (resize, optimize)
 */
const processImage = async (buffer) => {
  try {
    return await sharp(buffer)
      .resize(1920, 1080, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (error) {
    logger.warn('Image processing failed, using original:', error);
    return buffer;
  }
};

/**
 * Get file extension from filename
 */
const getFileExtension = (filename) => {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
};

/**
 * Delete file from cloud storage
 */
const deleteFromCloudStorage = async (url) => {
  try {
    if (url.includes('amazonaws.com')) {
      return await deleteFromS3(url);
    } else if (url.includes('storage.googleapis.com')) {
      return await deleteFromGCS(url);
    }
  } catch (error) {
    logger.error('File deletion error:', error);
    throw error;
  }
};

/**
 * Delete file from AWS S3
 */
const deleteFromS3 = async (url) => {
  const key = url.split('/').pop();
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  };
  
  await s3.deleteObject(params).promise();
};

/**
 * Delete file from Google Cloud Storage
 */
const deleteFromGCS = async (url) => {
  const fileName = url.split('/').pop();
  const bucket = gcs.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
  const file = bucket.file(fileName);
  
  await file.delete();
};

/**
 * Generate signed URL for private file access
 */
const generateSignedUrl = async (fileName, expiresIn = 3600) => {
  try {
    if (process.env.AWS_S3_BUCKET) {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Expires: expiresIn
      };
      
      return await s3.getSignedUrlPromise('getObject', params);
    } else if (process.env.GOOGLE_CLOUD_STORAGE_BUCKET) {
      const bucket = gcs.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
      const file = bucket.file(fileName);
      
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000
      });
      
      return signedUrl;
    }
  } catch (error) {
    logger.error('Signed URL generation error:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudStorage,
  deleteFromCloudStorage,
  generateSignedUrl,
  processImage
};