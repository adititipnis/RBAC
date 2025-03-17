const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const authMiddleware = require('../middleware/auth')
const User = require('../models/User')
const Role = require('../models/Role')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email role')
      .populate('role', 'name')
      .lean()

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, password, role: roleId } = req.body

    // Check if trying to assign Super Admin role
    const role = await Role.findById(roleId)
    if (!role) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    if (role.name === 'Super Admin') {
      return res.status(403).json({ 
        message: 'Super Admin role cannot be assigned through this interface' 
      })
    }

    const user = new User({
      name,
      email,
      password,
      role: roleId
    })

    await user.save()
    
    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('role', 'name')

    res.status(201).json(populatedUser)
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ message: 'Error creating user' })
  }
})

module.exports = router 
