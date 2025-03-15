require('dotenv').config()

const config = {
  development: {
    port: 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp'
  },
  production: {
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || '*',
    mongoUri: process.env.MONGODB_URI
  },
  test: {
    port: 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    mongoUri: 'mongodb://localhost:27017/myapp_test'
  }
}

const environment = process.env.VERCEL_ENV === 'production' ? 'production' 
  : process.env.NODE_ENV || 'development'

module.exports = config[environment] 
