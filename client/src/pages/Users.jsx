import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import './Users.css'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useAuth()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch users')
        }
        
        const data = await response.json()
        setUsers(data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    if (token) {
      fetchUsers()
    }
  }, [token])

  if (!token) return <div>Please log in</div>
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="layout">
      <NavBar />
      <div className="users-container">
        <div className="page-header">
          <h2>User Management</h2>
          <p>Manage system users and their roles</p>
        </div>
        <div className="content-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.roles.map(role => role.name).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users 