const Role = require('../models/Role')
const User = require('../models/User')

const validateUserManagement = async (req, res, next) => {
  try {
    const currentUserRole = await Role.findById(req.user.role.id)

    // For updates and deletes, check the target user's role
    if (req.params.id) {
      const targetUser = await User.findById(req.params.id).populate('role')
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Cannot modify users of same or higher level
      if (targetUser.role && currentUserRole.hierarchyLevel >= targetUser.role.hierarchyLevel) {
        return res.status(403).json({ 
          message: 'You cannot modify users at or above your role level' 
        })
      }
    }

    // For user creation, check the target role level
    if (req.method === 'POST' && req.body.role) {
      const targetRole = await Role.findById(req.body.role)
      if (!targetRole) {
        return res.status(400).json({ message: 'Invalid role specified' })
      }

      // Cannot create users at same or higher level
      if (currentUserRole.hierarchyLevel >= targetRole.hierarchyLevel) {
        return res.status(403).json({ 
          message: 'You cannot create users at or above your role level' 
        })
      }
    }

    // For user updates that include role changes
    if (req.method === 'PUT' && req.body.role) {
      const targetRole = await Role.findById(req.body.role)
      if (!targetRole) {
        return res.status(400).json({ message: 'Invalid role specified' })
      }

      // Cannot change users to same or higher level
      if (currentUserRole.hierarchyLevel >= targetRole.hierarchyLevel) {
        return res.status(403).json({ 
          message: 'You cannot assign roles at or above your level' 
        })
      }
    }

    next()
  } catch (error) {
    console.error('Error in validateUserManagement:', error)
    res.status(500).json({ message: error.message })
  }
}

module.exports = validateUserManagement 
