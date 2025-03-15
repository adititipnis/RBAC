const authService = require('../services/authService')

class AuthController {
  async login(req, res) {
    try {
      console.log('Login request received:', req.body)
      const { username, password } = req.body
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' })
      }

      const result = await authService.login(username, password)
      console.log('Login successful for user:', username)
      res.json(result)
    } catch (error) {
      console.error('Login error:', error.message)
      res.status(401).json({ message: error.message })
    }
  }
}

module.exports = new AuthController() 
