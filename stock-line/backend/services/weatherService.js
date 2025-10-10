const axios = require('axios');

let weatherApiKey;

const initializeWeatherService = async () => {
  try {
    weatherApiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!weatherApiKey) {
      console.log('OpenWeatherMap API key not provided. Weather features will be limited.');
      return false;
    }

    // Test API key with a simple request
    const testResponse = await axios.get('http://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: 'London',
        appid: weatherApiKey,
        units: 'metric'
      },
      timeout: 5000
    });

    if (testResponse.status === 200) {
      console.log('Weather Service initialized successfully');
      return true;
    } else {
      throw new Error('Weather API test failed');
    }
  } catch (error) {
    console.error('Weather Service initialization failed:', error.message);
    console.log('Weather features will be limited.');
    return false;
  }
};

const getCurrentWeather = async (city, state, country = 'IN') => {
  try {
    if (!weatherApiKey) {
      throw new Error('Weather API key not configured');
    }

    const location = `${city}, ${state}, ${country}`;
    const response = await axios.get('http://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: weatherApiKey,
        units: 'metric'
      },
      timeout: 10000
    });

    if (response.status === 200) {
      return {
        location: response.data.name,
        country: response.data.sys.country,
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        weather: response.data.weather[0].main,
        description: response.data.weather[0].description,
        windSpeed: response.data.wind.speed,
        visibility: response.data.visibility,
        timestamp: new Date()
      };
    } else {
      throw new Error('Weather API returned error');
    }
  } catch (error) {
    console.error('Weather fetch error:', error.message);
    throw new Error('Failed to fetch weather data');
  }
};

const getWeatherForecast = async (city, state, country = 'IN', days = 5) => {
  try {
    if (!weatherApiKey) {
      throw new Error('Weather API key not configured');
    }

    const location = `${city}, ${state}, ${country}`;
    const response = await axios.get('http://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: location,
        appid: weatherApiKey,
        units: 'metric',
        cnt: days * 8 // 8 forecasts per day (every 3 hours)
      },
      timeout: 15000
    });

    if (response.status === 200) {
      const forecasts = response.data.list.map(item => ({
        timestamp: new Date(item.dt * 1000),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        weather: item.weather[0].main,
        description: item.weather[0].description,
        windSpeed: item.wind.speed,
        precipitation: item.rain ? item.rain['3h'] || 0 : 0
      }));

      return {
        location: response.data.city.name,
        country: response.data.city.country,
        forecasts,
        generatedAt: new Date()
      };
    } else {
      throw new Error('Weather forecast API returned error');
    }
  } catch (error) {
    console.error('Weather forecast error:', error.message);
    throw new Error('Failed to fetch weather forecast');
  }
};

const getWeatherAlerts = async (city, state, country = 'IN') => {
  try {
    if (!weatherApiKey) {
      throw new Error('Weather API key not configured');
    }

    const location = `${city}, ${state}, ${country}`;
    const response = await axios.get('http://api.openweathermap.org/data/2.5/onecall', {
      params: {
        lat: 0, // This would need to be geocoded from city name
        lon: 0, // This would need to be geocoded from city name
        appid: weatherApiKey,
        units: 'metric',
        exclude: 'minutely,hourly,daily'
      },
      timeout: 10000
    });

    // For now, return basic alerts based on current weather
    const currentWeather = await getCurrentWeather(city, state, country);
    const alerts = [];

    if (currentWeather.temperature > 35) {
      alerts.push({
        type: 'heat_wave',
        severity: 'moderate',
        message: 'High temperature alert. Consider stocking cold drinks and ice cream.',
        impact: 'Increased demand for cooling products'
      });
    }

    if (currentWeather.humidity > 80) {
      alerts.push({
        type: 'high_humidity',
        severity: 'low',
        message: 'High humidity detected. Monitor perishable goods closely.',
        impact: 'Faster spoilage of perishable items'
      });
    }

    if (currentWeather.weather.toLowerCase().includes('rain')) {
      alerts.push({
        type: 'rain',
        severity: 'moderate',
        message: 'Rainy weather expected. Consider stocking umbrellas and rain gear.',
        impact: 'Increased demand for rain protection items'
      });
    }

    return {
      location: currentWeather.location,
      alerts,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Weather alerts error:', error.message);
    return {
      location: `${city}, ${state}`,
      alerts: [],
      generatedAt: new Date(),
      error: 'Failed to fetch weather alerts'
    };
  }
};

const analyzeWeatherImpact = (weatherData, shopCategory) => {
  const impacts = [];

  if (!weatherData) {
    return impacts;
  }

  const { temperature, humidity, weather } = weatherData;

  // Temperature-based impacts
  if (temperature > 30) {
    if (shopCategory === 'grocery') {
      impacts.push({
        type: 'demand_increase',
        products: ['cold drinks', 'ice cream', 'frozen foods', 'fruits'],
        reason: 'Hot weather increases demand for cooling products',
        confidence: 0.8
      });
    } else if (shopCategory === 'pharmacy') {
      impacts.push({
        type: 'demand_increase',
        products: ['electrolytes', 'sunscreen', 'heat stroke medicines'],
        reason: 'Hot weather increases health concerns',
        confidence: 0.7
      });
    }
  } else if (temperature < 15) {
    if (shopCategory === 'grocery') {
      impacts.push({
        type: 'demand_increase',
        products: ['hot beverages', 'soup', 'warm foods'],
        reason: 'Cold weather increases demand for warming products',
        confidence: 0.8
      });
    } else if (shopCategory === 'clothing') {
      impacts.push({
        type: 'demand_increase',
        products: ['winter wear', 'jackets', 'sweaters', 'blankets'],
        reason: 'Cold weather increases demand for warm clothing',
        confidence: 0.9
      });
    }
  }

  // Weather condition impacts
  if (weather.toLowerCase().includes('rain')) {
    impacts.push({
      type: 'demand_increase',
      products: ['umbrellas', 'raincoats', 'waterproof items'],
      reason: 'Rainy weather increases demand for rain protection',
      confidence: 0.9
    });

    if (shopCategory === 'pharmacy') {
      impacts.push({
        type: 'demand_increase',
        products: ['cold medicines', 'vitamin C', 'immune boosters'],
        reason: 'Rainy weather increases risk of cold and flu',
        confidence: 0.6
      });
    }
  }

  // Humidity impacts
  if (humidity > 80) {
    impacts.push({
      type: 'storage_concern',
      products: ['perishable items', 'paper products', 'electronics'],
      reason: 'High humidity can damage sensitive products',
      confidence: 0.7
    });
  }

  return impacts;
};

module.exports = {
  initializeWeatherService,
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  analyzeWeatherImpact
};