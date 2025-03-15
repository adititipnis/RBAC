const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('MongoDB Connected')
    return conn
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

module.exports = connectDB 
