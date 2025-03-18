const User = require('../models/User')

class UserController {
  async listUsers(req, res) {
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
      const user = await User.create({
        name,
        email,
        password,
        role
      })

      const userData = await User.findById(user._id)
        .populate('role', 'name')
        .select('-password')

      res.status(201).json(userData)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async updateUser(req, res) {
    try {
      const updates = { ...req.body }
      delete updates.password // Don't allow password updates through this endpoint

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
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
