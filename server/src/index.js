const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

// Import models
require('./models/Role');
require('./models/User');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const clientRoutes = require('./routes/clientRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/clients', clientRoutes);

// Error Handler
app.use(errorHandler);

// Only connect to MongoDB if not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; 
