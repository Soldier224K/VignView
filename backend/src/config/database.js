const knex = require('knex');
const logger = require('../utils/logger');

const config = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  },
  pool: {
    min: 2,
    max: 10
  }
};

const db = knex(config);

// Test database connection
const connectDB = async () => {
  try {
    await db.raw('SELECT 1');
    logger.info('✅ Database connected successfully');
    
    // Run migrations in development
    if (process.env.NODE_ENV === 'development') {
      await db.migrate.latest();
      logger.info('✅ Database migrations completed');
    }
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

module.exports = { db, connectDB };