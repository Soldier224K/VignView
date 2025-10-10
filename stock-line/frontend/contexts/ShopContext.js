import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchShop();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchShop = async () => {
    try {
      const response = await axios.get('/api/shops/my-shop');
      setShop(response.data.shop);
    } catch (error) {
      if (error.response?.status === 404) {
        // No shop found - this is normal for new users
        setShop(null);
      } else {
        console.error('Failed to fetch shop:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const createShop = async (shopData) => {
    try {
      const response = await axios.post('/api/shops', shopData);
      setShop(response.data.shop);
      return response.data.shop;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Shop creation failed');
    }
  };

  const updateShop = async (shopId, shopData) => {
    try {
      const response = await axios.put(`/api/shops/${shopId}`, shopData);
      setShop(response.data.shop);
      return response.data.shop;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Shop update failed');
    }
  };

  const deleteShop = async (shopId) => {
    try {
      await axios.delete(`/api/shops/${shopId}`);
      setShop(null);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Shop deletion failed');
    }
  };

  const getShopStats = async (shopId) => {
    try {
      const response = await axios.get(`/api/shops/${shopId}/stats`);
      return response.data.stats;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch shop stats');
    }
  };

  const value = {
    shop,
    loading,
    createShop,
    updateShop,
    deleteShop,
    getShopStats,
    fetchShop
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};