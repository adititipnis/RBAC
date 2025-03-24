import { API_BASE_URL } from '../config'

class ClientService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/clients`
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

  async getClients(token) {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch clients');
      }

      return response.json()
    } catch (error) {
      this.handleApiError(error);
    }
  }
}

export default new ClientService() 
