import { API_BASE_URL } from '../config'

class AuthService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/auth`
  }

  // Standard error handler
  handleApiError(error) {
    const errorMessage = 
      error.response?.data?.error?.message || 
      error.response?.data?.message || 
      error.message || 
      'An unknown error occurred';
    
    console.error('API Error:', errorMessage);
    throw new Error(errorMessage);
  }

  async login(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Login failed');
      }

      return response.json()
    } catch (error) {
      this.handleApiError(error);
    }
  }
}

export default new AuthService() 
