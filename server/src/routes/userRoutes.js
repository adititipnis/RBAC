const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const User = require('../models/User')
const Role = require('../models/Role')
const userController = require('../controllers/userController')
const checkPermission = require('../middleware/checkPermission')
const validateUserManagement = require('../middleware/validateUserManagement')

// Apply auth middleware to all routes
router.use(auth)

// Apply permission check for users page
router.use(checkPermission('userManagement'))

router.get('/', userController.listUsers)
router.post('/', validateUserManagement, userController.createUser)
router.get('/:id', userController.getUser)
router.put('/:id', validateUserManagement, userController.updateUser)
router.delete('/:id', validateUserManagement, userController.deleteUser)

module.exports = router 
