const axios = require('axios');

let mlServiceUrl;

const initializeMLService = async () => {
  try {
    mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    // Test connection to ML service
    const response = await axios.get(`${mlServiceUrl}/health`, { timeout: 5000 });
    
    if (response.data.status === 'healthy') {
      console.log('ML Service connected successfully');
      return true;
    } else {
      throw new Error('ML Service health check failed');
    }
  } catch (error) {
    console.error('ML Service connection failed:', error.message);
    console.log('ML Service will be unavailable. Some features may not work.');
    return false;
  }
};

const analyzeImage = async (imageData, shopCategory) => {
  try {
    if (!mlServiceUrl) {
      throw new Error('ML Service not initialized');
    }

    const response = await axios.post(`${mlServiceUrl}/analyze-image`, {
      image_data: imageData,
      shop_category: shopCategory
    }, {
      timeout: 30000 // 30 seconds timeout for image analysis
    });

    return response.data;
  } catch (error) {
    console.error('Image analysis error:', error.message);
    throw new Error('Image analysis failed');
  }
};

const uploadImage = async (imageFile, shopCategory) => {
  try {
    if (!mlServiceUrl) {
      throw new Error('ML Service not initialized');
    }

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('shop_category', shopCategory);

    const response = await axios.post(`${mlServiceUrl}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000
    });

    return response.data;
  } catch (error) {
    console.error('Image upload error:', error.message);
    throw new Error('Image upload failed');
  }
};

const forecastDemand = async (productName, currentStock, shopCategory, location, historicalSales = []) => {
  try {
    if (!mlServiceUrl) {
      throw new Error('ML Service not initialized');
    }

    const response = await axios.post(`${mlServiceUrl}/forecast-demand`, {
      product_name: productName,
      current_stock: currentStock,
      shop_category: shopCategory,
      location: location,
      historical_sales: historicalSales
    }, {
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    console.error('Demand forecast error:', error.message);
    throw new Error('Demand forecast failed');
  }
};

const batchForecast = async (products, shopCategory, location) => {
  try {
    if (!mlServiceUrl) {
      throw new Error('ML Service not initialized');
    }

    const response = await axios.post(`${mlServiceUrl}/batch-forecast`, {
      products,
      shop_category: shopCategory,
      location: location
    }, {
      timeout: 30000
    });

    return response.data;
  } catch (error) {
    console.error('Batch forecast error:', error.message);
    throw new Error('Batch forecast failed');
  }
};

const getWeatherData = async (location) => {
  try {
    if (!mlServiceUrl) {
      throw new Error('ML Service not initialized');
    }

    const response = await axios.get(`${mlServiceUrl}/weather/${encodeURIComponent(location)}`, {
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    console.error('Weather data error:', error.message);
    throw new Error('Weather data fetch failed');
  }
};

module.exports = {
  initializeMLService,
  analyzeImage,
  uploadImage,
  forecastDemand,
  batchForecast,
  getWeatherData
};