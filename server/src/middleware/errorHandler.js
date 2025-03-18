const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  if (err.name === 'MongoTimeoutError') {
    return res.status(503).json({ message: 'Database timeout. Please try again.' })
  }

  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({ message: 'Database connection error. Please try again.' })
  }

  // Always return JSON
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}

module.exports = errorHandler 
