const express = require('express')
const router = express.Router()
const roleController = require('../controllers/roleController')
const auth = require('../middleware/auth')
const checkPermission = require('../middleware/checkPermission')
const validateRoleManagement = require('../middleware/validateRoleManagement')
const Role = require('../models/Role')
const { errorResponse } = require('../utils/errorResponse')

// Apply auth middleware to all routes
router.use(auth)

// Apply permission check for role management
router.use(checkPermission('roleManagement'))

// Specific routes must come before parameter routes
router.get('/available', async (req, res) => {
  try {
    const currentUserRole = await Role.findById(req.user.role.id)
    
    // Find all roles with higher hierarchy level
    const availableRoles = await Role.find({
      hierarchyLevel: { $gt: currentUserRole.hierarchyLevel }
    })
    .setOptions({ currentUser: req.user })
    .select('name _id')

    res.json(availableRoles)
  } catch (error) {
    errorResponse(res, 'SERVER_ERROR', 'Error fetching available roles', error.message)
  }
})

// Standard routes
router.get('/', roleController.listRoles)
router.post('/', validateRoleManagement, roleController.createRole)
router.get('/:id', roleController.getRole)
router.put('/:id', validateRoleManagement, roleController.updateRole)
router.delete('/:id', validateRoleManagement, roleController.deleteRole)

module.exports = router 
