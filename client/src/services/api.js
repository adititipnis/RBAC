import { currentConfig } from '../config'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export const api = {
  async login(username, password) {
    try {
      const response = await fetch(`${currentConfig.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      if (!response.ok) throw new Error('Login failed')
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  async fetchWelcomeMessage() {
    try {
      const response = await fetch(`${currentConfig.apiUrl}`, {
        headers: getHeaders()
      })
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
} 
