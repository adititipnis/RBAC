const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const User = require('../models/User')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email roles')
      .populate('roles', 'name')
      .lean()

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' })
  }
})

module.exports = router 