const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const User = require('../models/User')
const Role = require('../models/Role')
const userController = require('../controllers/userController')
const checkPermission = require('../middleware/checkPermission')

// Apply auth middleware to all routes
router.use(auth)

// Apply permission check for users page
router.use(checkPermission('userManagement'))

router.get('/', userController.listUsers)
router.post('/', checkPermission('userManagement', 'create'), userController.createUser)
router.get('/:id', userController.getUser)
router.put('/:id', checkPermission('userManagement', 'update'), userController.updateUser)
router.delete('/:id', checkPermission('userManagement', 'delete'), userController.deleteUser)

module.exports = router 
