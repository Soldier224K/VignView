import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CloudIcon, SunIcon, BoltIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

export default function WeatherWidget({ city, state, category }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (city && state) {
      fetchWeather();
    } else {
      setLoading(false);
    }
  }, [city, state]);

  const fetchWeather = async () => {
    try {
      const response = await axios.get(`/api/weather/${city},${state}`);
      setWeather(response.data.weather);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      setError('Weather data unavailable');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return <SunIcon className="h-6 w-6 text-yellow-500" />;
    } else if (conditionLower.includes('cloud')) {
      return <CloudIcon className="h-6 w-6 text-gray-500" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('storm')) {
      return <BoltIcon className="h-6 w-6 text-blue-500" />;
    } else {
      return <CloudIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getWeatherImpact = () => {
    if (!weather || !category) return null;

    const temp = weather.temperature;
    const condition = weather.weather?.toLowerCase() || '';

    const impacts = [];

    if (temp > 30) {
      if (category === 'grocery') {
        impacts.push('High demand for cold drinks and ice cream');
      } else if (category === 'pharmacy') {
        impacts.push('Increased need for heat stroke prevention');
      }
    } else if (temp < 15) {
      if (category === 'grocery') {
        impacts.push('Higher demand for hot beverages');
      } else if (category === 'clothing') {
        impacts.push('Winter wear sales may increase');
      }
    }

    if (condition.includes('rain')) {
      impacts.push('Umbrellas and rain gear in demand');
    }

    return impacts;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Weather</h3>
        </div>
        <div className="card-content">
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="md" text="Loading weather..." />
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Weather</h3>
        </div>
        <div className="card-content">
          <div className="text-center py-8">
            <CloudIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{error || 'Weather data unavailable'}</p>
          </div>
        </div>
      </div>
    );
  }

  const impacts = getWeatherImpact();

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Weather</h3>
        <p className="text-sm text-gray-500">{weather.location}</p>
      </div>
      <div className="card-content">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Current Weather */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getWeatherIcon(weather.weather)}
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(weather.temperature)}°C
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {weather.description}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Humidity: {weather.humidity}%</p>
              <p>Wind: {weather.windSpeed} m/s</p>
            </div>
          </div>

          {/* Weather Impact */}
          {impacts && impacts.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                💡 Sales Impact
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                {impacts.map((impact, index) => (
                  <li key={index}>• {impact}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}