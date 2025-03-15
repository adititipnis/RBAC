const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  if (err.name === 'MongoTimeoutError') {
    return res.status(503).json({ message: 'Database timeout. Please try again.' })
  }

  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({ message: 'Database connection error. Please try again.' })
  }

  res.status(500).json({ message: 'Internal server error' })
}

module.exports = errorHandler 
