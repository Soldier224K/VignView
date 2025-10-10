import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useShop } from '../contexts/ShopContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import StatsCard from './StatsCard';
import RecentSales from './RecentSales';
import LowStockAlerts from './LowStockAlerts';
import QuickActions from './QuickActions';
import WeatherWidget from './WeatherWidget';
import LoadingSpinner from './LoadingSpinner';

export default function Dashboard() {
  const { shop, getShopStats } = useShop();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shop) {
      fetchStats();
    }
  }, [shop]);

  const fetchStats = async () => {
    try {
      const statsData = await getShopStats(shop.id);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white"
        >
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-primary-100">
            Here's what's happening at {shop?.name} today.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon="📦"
            color="primary"
          />
          <StatsCard
            title="Monthly Sales"
            value={stats?.monthlySales || 0}
            icon="💰"
            color="success"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`₹${stats?.monthlyRevenue?.toLocaleString() || 0}`}
            icon="📈"
            color="warning"
          />
          <StatsCard
            title="Low Stock Items"
            value={stats?.lowStockItems || 0}
            icon="⚠️"
            color="danger"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Sales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RecentSales shopId={shop?.id} />
            </motion.div>

            {/* Low Stock Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <LowStockAlerts shopId={shop?.id} />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <QuickActions />
            </motion.div>

            {/* Weather Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <WeatherWidget 
                city={shop?.city} 
                state={shop?.state} 
                category={shop?.category}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}