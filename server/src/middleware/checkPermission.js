/**
 * Middleware to check if user has required permission for a page
 * @param {string} pageType - The type of page to check permissions for
 * @param {string} action - The action to check (default: 'read')
 */
const checkPermission = (pageType, action = 'read') => {
  return (req, res, next) => {
    try {
      // Always allow read actions
      if (action === 'read') {
        return next()
      }

      // Get user permissions from JWT token data
      const userPermissions = req.user.permissions

      // Check if user has permission for this page
      const pagePermissions = userPermissions[pageType]
      if (!pagePermissions || !pagePermissions.includes(action)) {
        return res.status(403).json({
          message: `Access denied. Missing ${action} permission for ${pageType}`
        })
      }

      next()
    } catch (error) {
      res.status(403).json({
        message: 'Access denied. Invalid permissions'
      })
    }
  }
}

module.exports = checkPermission 
