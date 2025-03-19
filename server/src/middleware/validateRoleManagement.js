const Role = require('../models/Role')

const validateRoleManagement = async (req, res, next) => {
  try {
    const currentUserRole = await Role.findById(req.user.role.id)

    // For updates and deletes
    if (req.params.id) {
      const targetRole = await Role.findById(req.params.id)
      if (!targetRole) {
        return res.status(404).json({ message: 'Role not found' })
      }

      // Cannot modify roles at same or higher level
      if (currentUserRole.hierarchyLevel >= targetRole.hierarchyLevel) {
        return res.status(403).json({ 
          message: 'You cannot modify roles at or above your level' 
        })
      }
    }

    // For role creation
    if (req.method === 'POST') {
      if (currentUserRole.hierarchyLevel >= req.body.hierarchyLevel) {
        return res.status(403).json({ 
          message: 'You cannot create roles at or above your level' 
        })
      }
    }

    next()
  } catch (error) {
    console.error('Error in validateRoleManagement:', error)
    res.status(500).json({ message: error.message })
  }
}

module.exports = validateRoleManagement 
