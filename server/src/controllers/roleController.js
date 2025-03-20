const Role = require('../models/Role')

class RoleController {
  async getRoles(req, res) {
    try {
      const roles = await Role.find()
        .sort({ hierarchyLevel: 1 })
        .select('name permissions hierarchyLevel')
      
      if (req.user.role.hierarchyLevel >= 2) {
        return res.json(roles.filter(role => 
          role.hierarchyLevel >= 2 && role.hierarchyLevel > req.user.role.hierarchyLevel
        ))
      }

      res.json(roles.filter(role => 
        role.hierarchyLevel > req.user.role.hierarchyLevel
      ))
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
      if (req.user.role.hierarchyLevel >= req.body.hierarchyLevel) {
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
      const { hierarchyLevel } = req.body
      const currentUserHierarchy = req.user.role.hierarchyLevel

      // Validate hierarchy levels in one check
      if (hierarchyLevel && currentUserHierarchy >= hierarchyLevel) {
        return res.status(403).json({ 
          message: 'Cannot set role to same or higher level than your role' 
        })
      }

      const updatedRole = await Role.findOneAndUpdate(
        { 
          _id: req.params.id,
          hierarchyLevel: { $gt: currentUserHierarchy } // Only update roles below user's level
        },
        req.body,
        { 
          new: true, 
          runValidators: true,
          select: 'name permissions hierarchyLevel'
        }
      )

      if (!updatedRole) {
        return res.status(403).json({ 
          message: 'Cannot modify role at same or higher level than your role' 
        })
      }

      res.json(updatedRole)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async deleteRole(req, res) {
    try {
      const deletedRole = await Role.findOneAndDelete({
        _id: req.params.id,
        hierarchyLevel: { $gt: req.user.role.hierarchyLevel }
      })

      if (!deletedRole) {
        return res.status(403).json({ 
          message: 'Cannot delete role at same or higher level than your role' 
        })
      }

      res.json({ message: 'Role deleted successfully' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = new RoleController() 
