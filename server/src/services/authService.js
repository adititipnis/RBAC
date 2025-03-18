const jwt = require('jsonwebtoken')
const User = require('../models/User')

class AuthService {
  async login(email, password) {
    try {
      const user = await User.findOne({ email })
        .populate({
          path: 'role',
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

      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        throw new Error('Invalid email or password')
      }

      const permissions = {}
      if (user.role?.permissions?.length > 0) {
        user.role.permissions.forEach(perm => {
          permissions[perm.pageType] = perm.allowedActions
        })
      }

      const userData = {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role._id,
          name: user.role.name
        },
        permissions
      }

      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' })

      return { token, user: userData }
    } catch (error) {
      throw error
    }
  }
}

module.exports = new AuthService() 
