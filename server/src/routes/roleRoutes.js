const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const Role = require('../models/Role')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const roles = await Role.find({})
      .select('_id name permissions')
      .lean()

    console.log('Sending roles:', roles)
    res.json(roles)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles' })
  }
})

module.exports = router 