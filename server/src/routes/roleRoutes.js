const express = require('express')
const router = express.Router()
const roleController = require('../controllers/roleController')
const auth = require('../middleware/auth')
const checkPermission = require('../middleware/checkPermission')
const validateRoleManagement = require('../middleware/validateRoleManagement')
const Role = require('../models/Role')

// Apply auth middleware to all routes
router.use(auth)

// Apply permission check for role management
router.use(checkPermission('roleManagement'))

router.get('/', roleController.getRoles)
router.post('/', validateRoleManagement, roleController.createRole)
router.get('/:id', roleController.getRole)
router.put('/:id', validateRoleManagement, roleController.updateRole)
router.delete('/:id', validateRoleManagement, roleController.deleteRole)

// Get roles that can be assigned by the current user
router.get('/available', async (req, res) => {
  try {
    const currentUserRole = await Role.findById(req.user.role.id)
    
    // Find all roles with higher hierarchy level
    const availableRoles = await Role.find({
      hierarchyLevel: { $gt: currentUserRole.hierarchyLevel }
    }).select('name _id')

    res.json(availableRoles)
  } catch (error) {
    console.error('Error fetching available roles:', error)
    res.status(500).json({ message: error.message })
  }
})

module.exports = router 
