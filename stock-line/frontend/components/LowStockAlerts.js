import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

export default function LowStockAlerts({ shopId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      fetchLowStockAlerts();
    }
  }, [shopId]);

  const fetchLowStockAlerts = async () => {
    try {
      const response = await axios.get('/api/inventory/alerts/low-stock');
      setAlerts(response.data.lowStockItems);
    } catch (error) {
      console.error('Failed to fetch low stock alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Low Stock Alerts</h3>
        </div>
        <div className="card-content">
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="md" text="Loading alerts..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Low Stock Alerts</h3>
          {alerts.length > 0 && (
            <span className="badge badge-danger">{alerts.length}</span>
          )}
        </div>
        <p className="text-sm text-gray-500">Items that need restocking</p>
      </div>
      <div className="card-content">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-500">All items are well stocked!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-warning-50 border border-warning-200 rounded-lg"
              >
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.currentStock} {item.unit} remaining
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-warning-600 font-medium">
                    Min: {item.minStock}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.category}
                  </p>
                </div>
              </motion.div>
            ))}
            {alerts.length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                +{alerts.length - 5} more items need attention
              </p>
            )}
          </div>
        )}
      </div>
      {alerts.length > 0 && (
        <div className="card-footer">
          <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
            View all alerts →
          </button>
        </div>
      )}
    </div>
  );
}