const express = require('express')
const messageController = require('../controllers/messageController')
const auth = require('../middleware/auth')
const checkRole = require('../middleware/checkRole')

const router = express.Router()

// Protected route - only logged in users
router.get('/', auth, messageController.getMessage)

// Admin only route
router.post('/messages', auth, checkRole('admin'), messageController.createMessage)

module.exports = router 
