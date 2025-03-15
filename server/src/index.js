const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const connectDB = require('./config/database');
const messageRoutes = require('./routes/messageRoutes');
const authRoutes = require('./routes/authRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy - add this before other middleware
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security headers
app.use(helmet());

// Enable CORS with strict options
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 600 // 10 minutes
}));

// Apply rate limiting to all routes
app.use(apiLimiter);

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/', messageRoutes);
app.use('/auth', authRoutes);

// Start server in all environments (remove the condition)
app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});

// Export for Vercel
module.exports = app; 
