const ERROR_TYPES = require('./errorTypes');

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

/**
 * Send a standardized error response
 * @param {Object} res - Express response object
 * @param {String} type - Error type from ERROR_TYPES
 * @param {String} message - User-friendly error message
 * @param {String} details - Optional technical details (for logging)
 */
function errorResponse(res, type, message, details) {
  // Log error details for server-side debugging
  if (details) {
    console.error(`${type} Error: ${message} - ${details}`);
  }

  // Map error types to status codes
  const statusCodes = {
    [ERROR_TYPES.NOT_FOUND]: 404,
    [ERROR_TYPES.VALIDATION]: 400,
    [ERROR_TYPES.AUTHORIZATION]: 403,
    [ERROR_TYPES.SERVER_ERROR]: 500,
    [ERROR_TYPES.BAD_REQUEST]: 400
  };

  const statusCode = statusCodes[type] || 500;

  res.status(statusCode).json({
    error: {
      type,
      message
    }
  });
}

module.exports = { errorResponse, errorTypes, ERROR_TYPES } 
