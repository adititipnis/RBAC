const path = require('path')
const envPath = path.join(__dirname, '../../.env')
console.log('Loading .env from:', envPath)

require('dotenv').config({ path: envPath })

// Debug logging
console.log('Environment check:', {
  JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
  JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length,
  ENV_KEYS: Object.keys(process.env)
})

// Ensure JWT secret exists
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

module.exports = {
  port: 3000,
  mongoUri: process.env.MONGODB_URI,
  corsOrigin: 'http://localhost:5173',
  jwtSecret: 'my-super-secret-jwt-key-123',  // Simple hardcoded secret for now
  env: 'development'
} 
