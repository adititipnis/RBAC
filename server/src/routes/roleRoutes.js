const express = require('express')
const router = express.Router()
const roleController = require('../controllers/roleController')
const auth = require('../middleware/auth')
const Role = require('../models/Role')

router.get('/', auth, roleController.getRoles)
router.post('/', auth, roleController.createRole)
router.get('/:id', auth, roleController.getRole)
router.put('/:id', auth, roleController.updateRole)
router.delete('/:id', auth, roleController.deleteRole)

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
