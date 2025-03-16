const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

class AuthService {
  async login(email, password) {
    try {
      const user = await User.findOne({ email })
        .populate({
          path: 'roles',
          select: 'name permissions'
        })
        .populate({
          path: 'clientId',
          select: 'active isActive'
        })
        .maxTimeMS(5000)

      if (!user) {
        throw new Error('Invalid email or password')
      }

      if (user.lockUntil && user.lockUntil > Date.now()) {
        throw new Error('Account is temporarily locked. Please try again later')
      }

      if (!user.clientId && user.roles.some(role => 
        ['Client Super Admin', 'Client Admin'].includes(role.name)
      )) {
        throw new Error('Invalid account configuration')
      }

      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        user.failedLoginAttempts += 1
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000)
        }
        await user.save()
        throw new Error('Invalid email or password')
      }

      user.failedLoginAttempts = 0
      user.lockUntil = null
      await user.save()
      
      const permissions = user.roles.reduce((acc, role) => {
        role.permissions.forEach(perm => {
          if (!acc[perm.pageType]) {
            acc[perm.pageType] = new Set()
          }
          perm.allowedActions.forEach(action => acc[perm.pageType].add(action))
        })
        return acc
      }, {})

      const flatPermissions = Object.entries(permissions).reduce((acc, [pageType, actions]) => {
        acc[pageType] = Array.from(actions)
        return acc
      }, {})

      const token = jwt.sign(
        {
          userId: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles?.map(role => role.name) || [],
          permissions: flatPermissions,
          ...(user.clientId ? { clientId: user.clientId._id } : {})
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      return {
        token,
        user: {
          name: user.name,
          email: user.email,
          roles: user.roles?.map(role => role.name) || [],
          permissions: flatPermissions,
          ...(user.clientId ? { clientId: user.clientId._id } : {})
        }
      }
    } catch (error) {
      throw error
    }
  }
}

module.exports = new AuthService() 
