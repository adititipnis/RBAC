const authService = require('../services/authService')

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email and password are required' 
        })
      }

      const result = await authService.login(email, password)
      res.json(result)
    } catch (error) {
      res.status(400).json({ 
        message: error.message || 'Authentication failed'
      })
    }
  }
}

module.exports = new AuthController() 
