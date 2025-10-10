import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import Dashboard from '../components/Dashboard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { shop, loading: shopLoading } = useShop();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || shopLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Stock Line!
            </h2>
            <p className="text-gray-600 mb-6">
              Let's set up your shop to get started with smart inventory management.
            </p>
            <button
              onClick={() => router.push('/shop/setup')}
              className="btn btn-primary btn-lg w-full"
            >
              Set Up Your Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}