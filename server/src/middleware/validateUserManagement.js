const Role = require('../models/Role')
const User = require('../models/User')
const { errorResponse } = require('../utils/errorResponse')

// Helper function to get consistent client ID
const getClientId = (client) => {
  if (!client) return null
  return client.id || client._id || client
}

const validateUserManagement = async (req, res, next) => {
  try {
    // Initialize variables for target entities
    let targetRole = null
    let targetUser = null
    
    // GET requests don't need validation
    if (req.method === 'GET') {
      return next()
    }
    
    // For PUT and DELETE requests
    if (req.method === 'PUT' || req.method === 'DELETE') {
      // Fetch the target user once with populated role
      targetUser = await User.findById(req.params.id).populate('role')
      
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' })
      }
      
      // Use the role from the populated user
      targetRole = targetUser.role
      
      // For PUT, if there's a new role specified, fetch that instead
      if (req.method === 'PUT' && req.body.role && req.body.role !== targetUser.role._id.toString()) {
        targetRole = await Role.findById(req.body.role)
      }
    } 
    // For POST requests
    else if (req.method === 'POST') {
      const { role: roleId } = req.body
      targetRole = await Role.findById(roleId)
    }
    
    // Validate the role
    if (!targetRole) {
      return errorResponse(res, 'VALIDATION', 'Invalid role')
    }
    
    // Update how we check hierarchy levels to ensure consistency
    // Check user's ability to manage this role based on hierarchy
    const userHierarchyLevel = req.user.role?.hierarchyLevel;
    if (userHierarchyLevel >= targetRole.hierarchyLevel) {
      return errorResponse(res, 'AUTHORIZATION', 'You cannot manage users with this role')
    }
    
    // For client-scoped users, ensure client matches
    if (req.user.role.hierarchyLevel >= 2 && targetRole.hierarchyLevel >= 2) {
      const userClientId = getClientId(req.user.client)
      
      if (!userClientId) {
        return res.status(403).json({ 
          message: 'Client-scoped users must have a client' 
        })
      }
      
      if (req.method === 'PUT' || req.method === 'DELETE') {
        const targetClientId = getClientId(targetUser.client)
        
        if (targetClientId && targetClientId.toString() !== userClientId.toString()) {
          return res.status(403).json({
            message: 'You can only manage users from your own client'
          })
        }
      }
      
      const { client: clientId } = req.body
      if (req.method === 'POST' && clientId && clientId.toString() !== userClientId.toString()) {
        return res.status(403).json({
          message: 'You can only create users for your own client'
        })
      }
    }
    
    next()
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', 'Error validating user management permissions', error.message)
  }
}

module.exports = validateUserManagement 
