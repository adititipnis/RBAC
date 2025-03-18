const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const User = require('../models/User')
const Role = require('../models/Role')
const userController = require('../controllers/userController')

router.get('/', auth, userController.getUsers)
router.post('/', auth, userController.createUser)
router.get('/:id', auth, userController.getUser)
router.put('/:id', auth, userController.updateUser)
router.delete('/:id', auth, userController.deleteUser)

module.exports = router 
