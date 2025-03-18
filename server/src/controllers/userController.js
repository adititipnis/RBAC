const User = require('../models/User')

class UserController {
  async getUsers(req, res) {
    try {
      const users = await User.find()
        .populate('role', 'name')
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
      
      if (!name || !email || !password || !role) {
        return res.status(400).json({ 
          message: 'Name, email, password, and role are required' 
        })
      }

      const user = new User({
        name,
        email,
        password,
        role
      })

      await user.save()
      
      const savedUser = await User.findById(user._id)
        .populate('role', 'name')
        .select('-password')
      
      res.status(201).json(savedUser)
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Email already exists' })
      }
      res.status(400).json({ 
        message: error.message || 'Error creating user',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      })
    }
  }

  async updateUser(req, res) {
    try {
      const { password, ...updateData } = req.body
      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      )
        .populate('role', 'name')
        .select('-password')
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
