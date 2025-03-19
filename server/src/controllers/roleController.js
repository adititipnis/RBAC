const Role = require('../models/Role')

class RoleController {
  async getRoles(req, res) {
    try {
      const roles = await Role.find()
      res.json(roles)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  async getRole(req, res) {
    try {
      const role = await Role.findById(req.params.id)
      if (!role) {
        return res.status(404).json({ message: 'Role not found' })
      }
      res.json(role)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  async createRole(req, res) {
    try {
      // Check if user can create role at this level
      const currentUserRole = await Role.findById(req.user.role.id)
      if (currentUserRole.hierarchyLevel >= req.body.hierarchyLevel) {
        return res.status(403).json({ 
          message: 'Cannot create role at same or higher level than your role' 
        })
      }

      const role = await Role.create(req.body)
      res.status(201).json(role)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async updateRole(req, res) {
    try {
      const targetRole = await Role.findById(req.params.id)
      if (!targetRole) {
        return res.status(404).json({ message: 'Role not found' })
      }

      // Check if user can modify this role
      const currentUserRole = await Role.findById(req.user.role.id)
      if (currentUserRole.hierarchyLevel >= targetRole.hierarchyLevel) {
        return res.status(403).json({ 
          message: 'Cannot modify role at same or higher level than your role' 
        })
      }

      // Prevent changing to higher level
      if (req.body.hierarchyLevel && currentUserRole.hierarchyLevel >= req.body.hierarchyLevel) {
        return res.status(403).json({ 
          message: 'Cannot set role to same or higher level than your role' 
        })
      }

      const updatedRole = await Role.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )

      res.json(updatedRole)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async deleteRole(req, res) {
    try {
      const targetRole = await Role.findById(req.params.id)
      if (!targetRole) {
        return res.status(404).json({ message: 'Role not found' })
      }

      // Check if user can delete this role
      const currentUserRole = await Role.findById(req.user.role.id)
      if (currentUserRole.hierarchyLevel >= targetRole.hierarchyLevel) {
        return res.status(403).json({ 
          message: 'Cannot delete role at same or higher level than your role' 
        })
      }

      await Role.findByIdAndDelete(req.params.id)
      res.json({ message: 'Role deleted successfully' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = new RoleController() 
