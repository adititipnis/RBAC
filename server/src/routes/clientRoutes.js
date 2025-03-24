const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Client = require('../models/Client')
const { errorResponse } = require('../utils/errorResponse')

router.use(auth)

// GET clients - with middleware security through setOptions
router.get('/', async (req, res) => {
  try {
    // If user is client level, only return their client
    if (req.user.role.hierarchyLevel >= 2) {
      const client = await Client.findById(req.user.client.id)
        .setOptions({ currentUser: req.user });
      
      return res.json(client ? [client] : [])
    }

    // For system admins, return all active clients
    const clients = await Client.find({ active: true })
      .setOptions({ currentUser: req.user });
      
    res.json(clients)
  } catch (error) {
    errorResponse(res, 'SERVER_ERROR', 'Error fetching clients', error.message)
  }
})

// GET client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .setOptions({ currentUser: req.user });
    
    if (!client) {
      return errorResponse(res, 'NOT_FOUND', 'Client not found')
    }
    
    res.json(client)
  } catch (error) {
    errorResponse(res, 'SERVER_ERROR', 'Error fetching client', error.message)
  }
})

module.exports = router 
