const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const authMiddleware = require('../middleware/auth')
const User = require('../models/User')

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
    const { name, email, password, role } = req.body
    const user = new User({ name, email, password, role })
    await user.save()
    
    const populatedUser = await User.findById(user._id)
      .select('name email role')
      .populate('role', 'name')
      .lean()
    
    res.status(201).json(populatedUser)
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ message: 'Error creating user' })
  }
})

module.exports = router 
