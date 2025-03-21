const User = require('../models/User')
const Role = require('../models/Role')

class UserController {
  async listUsers(req, res) {
    try {
      let query = {}
      
      // For Client Super Admin and Client Admin (level 2 and above)
      if (req.user.role.hierarchyLevel >= 2) {
        // Get all roles with higher hierarchy level (lower in rank)
        const roles = await Role.find({ 
          hierarchyLevel: { $gt: req.user.role.hierarchyLevel } 
        })
        const roleIds = roles.map(r => r._id)

        // Show users from same client with lower roles only
        query = {
          client: req.user.client._id,
          role: { $in: roleIds }
        }
      }

      const users = await User.find(query)
        .populate('role', 'name hierarchyLevel')
        .populate('client', 'name code')
        .select('-password')

      res.json(users)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  async getUser(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .populate('role', 'name')
        .select('-password')
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      
      res.json(user)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body
      let { client } = req.body

      // Get the selected role to check its type
      const selectedRole = await Role.findById(role)
      if (!selectedRole) {
        return res.status(400).json({ message: 'Invalid role' })
      }

      // Handle client assignment based on role hierarchy
      if (selectedRole.name === 'Client Super Admin' || selectedRole.name === 'Client Admin') {
        // For client-scoped roles, use the creator's client
        client = req.user.client._id
      }

      // Create user data object
      const userData = {
        name,
        email,
        password,
        role
      }

      // Only add client if it's set
      if (client) {
        userData.client = client
      }

      // Create the user
      const user = await User.create(userData)

      // Return populated user data
      const populatedUser = await User.findById(user._id)
        .populate('role', 'name hierarchyLevel')
        .populate('client', 'name code')
        .select('-password')

      res.status(201).json(populatedUser)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async updateUser(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { 
          new: true,
          runValidators: true 
        }
      ).populate('role')
        .populate('client')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      res.json(user)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id)
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      res.json({ message: 'User deleted successfully' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = new UserController() 
