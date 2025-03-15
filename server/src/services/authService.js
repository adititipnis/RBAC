const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const config = require('../config')

class AuthService {
  async login(username, password) {
    try {
      console.log('Login attempt for username:', username)
      
      const user = await User.findOne({ username }).maxTimeMS(5000)
      if (!user) {
        console.log('User not found')
        throw new Error('Invalid credentials')
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        throw new Error('Account is temporarily locked. Please try again later')
      }

      console.log('User found, checking password')
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        console.log('Invalid password')
        // Increment failed attempts
        user.failedLoginAttempts += 1
        
        // Lock account after 5 failed attempts
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = Date.now() + (15 * 60 * 1000) // 15 minutes
        }
        
        await user.save()
        throw new Error('Invalid credentials')
      }

      console.log('Password valid, generating token')
      // Reset failed attempts
      user.failedLoginAttempts = 0
      user.lockUntil = null
      await user.save()

      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          role: user.role,
          iat: Date.now()
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
          algorithm: 'HS256'
        }
      )

      return {
        token,
        user: {
          username: user.username,
          role: user.role
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }
}

module.exports = new AuthService() 
