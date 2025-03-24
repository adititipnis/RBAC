const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const roleRoutes = require('./routes/roleRoutes')
const clientRoutes = require('./routes/clientRoutes')
const { errorResponse } = require('./utils/errorResponse')

const app = express()

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Middleware
app.use(express.json())

// Routes
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/roles', roleRoutes)
app.use('/clients', clientRoutes)

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  errorResponse(
    res, 
    'SERVER_ERROR', 
    'An unexpected error occurred', 
    err.message
  )
})

module.exports = app 
