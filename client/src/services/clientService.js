import { API_BASE_URL } from '../config'

class ClientService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/clients`
  }

  async getClients(token) {
    const response = await fetch(this.baseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch clients')
    }

    return response.json()
  }
}

export default new ClientService() 