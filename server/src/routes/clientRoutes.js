const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Client = require('../models/Client')

router.use(auth)

router.get('/', async (req, res) => {
  try {
    // If user is client level, only return their client
    if (req.user.role.hierarchyLevel >= 2) {
      const client = await Client.findById(req.user.client.id)
      return res.json(client ? [client] : [])
    }

    // For system admins, return all active clients
    const clients = await Client.find({ active: true })
    res.json(clients)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router 
