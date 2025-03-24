import { API_BASE_URL } from '../config'

class UserService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/users`
  }

  // Add standardized error handling in API requests
  handleApiError(error) {
    // Extract error message from response if available
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'An unknown error occurred';
    
    console.error('API Error:', errorMessage);
    throw new Error(errorMessage);
  }

  async getUsers(token) {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      return response.json()
    } catch (error) {
      this.handleApiError(error)
    }
  }

  async createUser(userData, token) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create user');
      }

      return response.json()
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async updateUser(userId, userData, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update user');
      }

      return response.json()
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async deleteUser(userId, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete user');
      }

      return response.json()
    } catch (error) {
      this.handleApiError(error);
    }
  }
}

export default new UserService() 
