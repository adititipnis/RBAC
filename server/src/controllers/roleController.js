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
      const role = new Role(req.body)
      await role.save()
      res.status(201).json(role)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async updateRole(req, res) {
    try {
      const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!role) {
        return res.status(404).json({ message: 'Role not found' })
      }
      res.json(role)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async deleteRole(req, res) {
    try {
      const role = await Role.findByIdAndDelete(req.params.id)
      if (!role) {
        return res.status(404).json({ message: 'Role not found' })
      }
      res.json({ message: 'Role deleted' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = new RoleController() 
