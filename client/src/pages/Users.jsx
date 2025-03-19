import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import Modal from '../components/Modal'
import userService from '../services/userService'
import roleService from '../services/roleService'
import './Users.css'

function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  })
  const { user, token } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, rolesData] = await Promise.all([
          userService.getUsers(token),
          roleService.getRoles(token)
        ])

        setUsers(usersData)
        setRoles(rolesData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    if (token) {
      fetchData()
    }
  }, [token])

  // Filter roles based on current user's hierarchy level
  const availableRoles = roles.filter(role => 
    role.hierarchyLevel > user.role.hierarchyLevel
  )

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const data = await userService.createUser(newUser, token)
      setUsers([...users, data])
      setIsModalOpen(false)
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: ''
      })
    } catch (err) {
      setError(err.message)
    }
  }

  if (!token) return <div>Please log in</div>
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="layout">
      <NavBar />
      <div className="users-container">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h2>User Management</h2>
              <p>Manage system users and their roles</p>
            </div>
            <button className="create-button" onClick={() => setIsModalOpen(true)}>
              Create User
            </button>
          </div>
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
                  <td>{user.role ? user.role.name : 'No role assigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="create-user-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="select-single"
              required
            >
              <option value="">Select a role</option>
              {availableRoles.map(role => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Users 
