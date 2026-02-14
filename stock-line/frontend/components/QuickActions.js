import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  CameraIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      name: 'Add Product',
      description: 'Add new item to inventory',
      icon: PlusIcon,
      color: 'primary',
      href: '/inventory/add'
    },
    {
      name: 'Scan Shelf',
      description: 'Use AI to detect products',
      icon: CameraIcon,
      color: 'success',
      href: '/inventory/scan'
    },
    {
      name: 'New Sale',
      description: 'Create a new sale',
      icon: DocumentTextIcon,
      color: 'warning',
      href: '/sales/new'
    },
    {
      name: 'Generate Report',
      description: 'Create sales or stock report',
      icon: ChartBarIcon,
      color: 'secondary',
      href: '/reports'
    },
    {
      name: 'View Alerts',
      description: 'Check notifications',
      icon: BellIcon,
      color: 'danger',
      href: '/alerts'
    }
  ];

  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
    success: 'bg-success-50 text-success-600 hover:bg-success-100',
    warning: 'bg-warning-50 text-warning-600 hover:bg-warning-100',
    danger: 'bg-danger-50 text-danger-600 hover:bg-danger-100',
    secondary: 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500">Common tasks and shortcuts</p>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(action.href)}
                className={`p-3 rounded-lg text-left transition-colors ${colorClasses[action.color]}`}
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 mr-3" />
                  <div>
                    <p className="text-sm font-medium">{action.name}</p>
                    <p className="text-xs opacity-75">{action.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}