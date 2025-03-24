const { errorResponse } = require('../utils/errorResponse')

/**
 * Middleware to check if user has required permission for a page
 * @param {string} pageType - The type of page to check permissions for
 * @param {string} action - The action to check (default: 'read')
 */
const checkPermission = (pageType, action = 'read') => {
  return (req, res, next) => {
    try {
      // Check if user exists and has permissions
      if (!req.user || !req.user.permissions) {
        return errorResponse(res, 'AUTHORIZATION', 'Insufficient permissions')
      }
      
      // Get permissions for this page type
      const pagePermissions = req.user.permissions[pageType]
      
      // Check if user has the required permission
      if (!pagePermissions || !pagePermissions.includes(action)) {
        return errorResponse(
          res,
          'AUTHORIZATION',
          `You don't have permission to ${action} ${pageType}`
        )
      }
      
      // If permission exists and user has the required action
      next()
    } catch (error) {
      errorResponse(res, 'SERVER_ERROR', 'Permission check failed', error.message)
    }
  }
}

module.exports = checkPermission 
