const User = require('../models/User')
const Role = require('../models/Role')

class UserController {
  async listUsers(req, res) {
    try {
      let query = {}
      
      // Only filter by client for Client Super Admin and Client Admin (level 2 and above)
      if (req.user.role.hierarchyLevel >= 2) {
        query.client = req.user.client.id
      }

      const users = await User.find(query)
        .populate('role', 'name hierarchyLevel')
        .populate('client', 'name code')
        .select('-password')

      res.json(users)
    } catch (error) {
      console.error('Error in listUsers:', error)
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
      const { name, email, password, role, client } = req.body

      // Only enforce client for Client Super Admin and Client Admin
      if (req.user.role.hierarchyLevel >= 2) {
        if (client && client !== req.user.client.toString()) {
          return res.status(403).json({ 
            message: 'You can only create users for your own client' 
          })
        }
        // Force client to be the same as creator's
        req.body.client = req.user.client
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
        client: req.body.client
      })

      const userData = await User.findById(user._id)
        .populate('role', 'name')
        .populate('client', 'name code')
        .select('-password')

      res.status(201).json(userData)
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
