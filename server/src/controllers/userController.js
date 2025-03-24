const User = require('../models/User')
const Role = require('../models/Role')
const { getClientId } = require('../utils/clientUtils')

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

        // Get client ID consistently
        const clientId = getClientId(req.user.client)
        
        if (!clientId) {
          return res.status(400).json({
            message: 'Client not found for user with client-scoped role'
          })
        }
        
        // Show users from same client with lower roles only
        query = {
          client: clientId,
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

      // Get the selected role to check its hierarchy level
      const selectedRole = await Role.findById(role)
      if (!selectedRole) {
        return res.status(400).json({ message: 'Invalid role' })
      }

      // Create user data object
      const userData = {
        name,
        email,
        password,
        role
      }

      // Handle client assignment based on role hierarchy level
      // Client-scoped roles have hierarchy level >= 2
      if (selectedRole.hierarchyLevel >= 2) {
        if (!client && req.user && req.user.client) {
          // For client-scoped roles without explicit client, use the creator's client
          userData.client = getClientId(req.user.client)
        } else if (client) {
          // Use the provided client
          userData.client = client;
        } else {
          return res.status(400).json({ 
            message: 'Client is required for client-scoped roles' 
          })
        }
      } else if (client) {
        // For system roles, client is optional
        userData.client = client
      }

      // Set createdBy if user is authenticated
      if (req.user) {
        userData.createdBy = req.user.id || req.user._id;
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
