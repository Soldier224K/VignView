import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon, color = 'primary', trend, trendValue }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
    secondary: 'bg-secondary-50 text-secondary-600'
  };

  const iconBgClasses = {
    primary: 'bg-primary-100',
    success: 'bg-success-100',
    warning: 'bg-warning-100',
    danger: 'bg-danger-100',
    secondary: 'bg-secondary-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${iconBgClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && trendValue && (
              <span className={`ml-2 text-sm font-medium ${
                trend === 'up' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {trend === 'up' ? '↗' : '↘'} {trendValue}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}