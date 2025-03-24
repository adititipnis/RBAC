const Role = require('../models/Role')
const { errorResponse } = require('../utils/errorResponse')

class RoleController {
  async listRoles(req, res) {
    try {
      const roles = await Role.find()
        .setOptions({ currentUser: req.user })
        .sort('hierarchyLevel')
        .select('name hierarchyLevel permissions');
      
      res.json(roles)
    } catch (error) {
      errorResponse(res, 'SERVER_ERROR', 'Error listing roles', error.message)
    }
  }

  async getRole(req, res) {
    try {
      const role = await Role.findById(req.params.id)
        .setOptions({ currentUser: req.user });
      
      if (!role) {
        return errorResponse(res, 'NOT_FOUND', 'Role not found')
      }
      
      res.json(role)
    } catch (error) {
      errorResponse(res, 'SERVER_ERROR', 'Error fetching role', error.message)
    }
  }

  async createRole(req, res) {
    try {
      if (req.user.role.hierarchyLevel >= req.body.hierarchyLevel) {
        return errorResponse(
          res, 
          'AUTHORIZATION', 
          'Cannot create role with equal or higher hierarchy level than your own'
        )
      }
      
      const role = await Role.create(req.body)
      res.status(201).json(role)
    } catch (error) {
      errorResponse(res, 'VALIDATION', 'Error creating role', error.message)
    }
  }

  async updateRole(req, res) {
    try {
      const role = await Role.findByIdAndUpdate(
        req.params.id,
        req.body,
        { 
          new: true, 
          runValidators: true,
          currentUser: req.user
        }
      );
      
      if (!role) {
        return errorResponse(res, 'NOT_FOUND', 'Role not found')
      }
      
      res.json(role)
    } catch (error) {
      errorResponse(res, 'VALIDATION', 'Error updating role', error.message)
    }
  }

  async deleteRole(req, res) {
    try {
      const role = await Role.findByIdAndDelete(req.params.id)
        .setOptions({ currentUser: req.user });
      
      if (!role) {
        return errorResponse(res, 'NOT_FOUND', 'Role not found')
      }
      
      res.json({ message: 'Role deleted successfully' })
    } catch (error) {
      errorResponse(res, 'SERVER_ERROR', 'Error deleting role', error.message)
    }
  }
}

module.exports = new RoleController() 
