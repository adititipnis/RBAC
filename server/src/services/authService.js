const jwt = require('jsonwebtoken')
const User = require('../models/User')

class AuthService {
  async login(email, password) {
    try {
      const user = await User.findOne({ email })
        .populate({
          path: 'role',
          select: 'name permissions hierarchyLevel'
        })
        .populate('client', 'name code')
        .maxTimeMS(5000)

      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Check if user is active
      if (!user.active) {
        throw new Error('Account is inactive')
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        throw new Error('Account is temporarily locked. Please try again later')
      }

      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        // Increment failed attempts
        user.failedLoginAttempts += 1
        
        // Lock account after 5 failed attempts
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = Date.now() + (15 * 60 * 1000) // 15 minutes
        }
        
        await user.save()
        throw new Error('Invalid email or password')
      }

      // Reset failed attempts on successful login
      if (user.failedLoginAttempts > 0) {
        user.failedLoginAttempts = 0
        user.lockUntil = null
        await user.save()
      }

      // Check if client exists and is active (for client-related roles)
      if (user.client && (!user.client.active)) {
        throw new Error('Client account is inactive')
      }

      const permissions = {}
      if (user.role?.permissions) {
        user.role.permissions.forEach(permission => {
          permissions[permission.pageType] = permission.allowedActions
        })
      }

      const userData = {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role._id,
          name: user.role.name,
          hierarchyLevel: user.role.hierarchyLevel
        },
        client: user.client ? {
          id: user.client._id,
          name: user.client.name,
          code: user.client.code
        } : null,
        permissions
      }

      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' })

      return { 
        token, 
        user: userData
      }
    } catch (error) {
      throw error
    }
  }
}

module.exports = new AuthService() 
