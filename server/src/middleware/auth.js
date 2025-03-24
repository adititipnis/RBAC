const jwt = require('jsonwebtoken')
const Role = require('../models/Role')
const { errorResponse, ERROR_TYPES } = require('../utils/errorResponse')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return errorResponse(res, ERROR_TYPES.AUTHORIZATION, 'Access denied. No token provided')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Set basic user data from token
    req.user = decoded
    
    // Ensure role and permission data is current
    if (req.user.role && req.user.role._id) {
      // Get fresh role data (but only if we need the permissions)
      if (req.originalUrl !== '/api/auth/refresh') {
        try {
          const roleId = req.user.role._id || req.user.role.id
          const freshRole = await Role.findById(roleId)
          
          if (freshRole) {
            // Update role with fresh data
            req.user.role = {
              ...req.user.role,
              name: freshRole.name,
              hierarchyLevel: freshRole.hierarchyLevel
            }
            
            // Set permissions directly on the user object for consistent access
            req.user.permissions = freshRole.permissions.reduce((acc, p) => {
              acc[p.pageType] = p.allowedActions
              return acc
            }, {})
          }
        } catch (roleError) {
          // Log error but continue - we'll use the token data as fallback
          console.error('Error refreshing role data:', roleError)
        }
      }
    }
    
    next()
  } catch (error) {
    return errorResponse(res, ERROR_TYPES.AUTHORIZATION, 'Invalid token', error.message)
  }
}

module.exports = auth 
