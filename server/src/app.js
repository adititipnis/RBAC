const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const roleRoutes = require('./routes/roleRoutes')

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

// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Something broke!' })
})

module.exports = app 
