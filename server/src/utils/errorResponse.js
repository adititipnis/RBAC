/**
 * Utility for standardized error responses
 */
const errorTypes = {
  AUTHENTICATION: {
    status: 401,
    prefix: 'Authentication error'
  },
  AUTHORIZATION: {
    status: 403,
    prefix: 'Authorization error'
  },
  VALIDATION: {
    status: 400,
    prefix: 'Validation error'
  },
  NOT_FOUND: {
    status: 404,
    prefix: 'Not found'
  },
  SERVER_ERROR: {
    status: 500,
    prefix: 'Server error'
  }
}

const errorResponse = (res, type, message, details = null) => {
  const error = errorTypes[type] || errorTypes.SERVER_ERROR
  
  const response = {
    error: `${error.prefix}: ${message}`
  }
  
  if (details && process.env.NODE_ENV !== 'production') {
    response.details = details
  }
  
  return res.status(error.status).json(response)
}

module.exports = { errorResponse, errorTypes } 
