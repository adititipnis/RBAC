import { API_BASE_URL } from '../config'

class RoleService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/roles`
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

  async getRoles(token) {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch roles');
      }

      return response.json()
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async getRole(roleId, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch role');
      }

      return response.json()
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async updateRole(roleId, roleData, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${roleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update role');
      }

      return response.json()
    } catch (error) {
      this.handleApiError(error);
    }
  }
}

export default new RoleService() 
