import { API_BASE_URL } from '../config'

class RoleService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/roles`
  }

  async getRoles(token) {
    const response = await fetch(this.baseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch roles')
    }

    return response.json()
  }

  async updateRole(roleId, roleData, token) {
    const response = await fetch(`${this.baseUrl}/${roleId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roleData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    return response.json()
  }
}

export default new RoleService() 