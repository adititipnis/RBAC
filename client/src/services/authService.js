import { API_BASE_URL } from '../config'

class AuthService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/auth`
  }

  async login(credentials) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Login failed')
    }

    return response.json()
  }
}

export default new AuthService() 