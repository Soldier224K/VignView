import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';

export default function RecentSales({ shopId }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      fetchRecentSales();
    }
  }, [shopId]);

  const fetchRecentSales = async () => {
    try {
      const response = await axios.get(`/api/sales?limit=5`);
      setSales(response.data.sales);
    } catch (error) {
      console.error('Failed to fetch recent sales:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
        </div>
        <div className="card-content">
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="md" text="Loading sales..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
        <p className="text-sm text-gray-500">Latest transactions</p>
      </div>
      <div className="card-content">
        {sales.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent sales found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale, index) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {sale.saleNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sale.customerName || 'Walk-in Customer'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{sale.totalAmount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {sale.paymentMethod}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="card-footer">
        <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
          View all sales →
        </button>
      </div>
    </div>
  );
}