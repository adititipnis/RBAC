import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import userService from '../services/userService'
import roleService from '../services/roleService'
import clientService from '../services/clientService'
import './Users.css'

function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    client: ''
  })
  const { user, token, hasPermission } = useAuth()
  const showClientColumn = user.role.hierarchyLevel < 2 || users.some(u => u.client)
  const canCreateUser = hasPermission('userManagement', 'create')
  const canEditUser = hasPermission('userManagement', 'update')
  const canDeleteUser = hasPermission('userManagement', 'delete')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, rolesData, clientsData] = await Promise.all([
          userService.getUsers(token),
          roleService.getRoles(token),
          clientService.getClients(token)
        ])

        setUsers(usersData)
        setRoles(rolesData)
        setClients(clientsData)
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

  const isClientRole = (roleName) => {
    return ['Client Super Admin', 'Client Admin'].includes(roleName)
  }

  const selectedRole = roles.find(r => r._id === newUser.role)

  const handleEdit = (user) => {
    setEditingUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role._id,
      client: user.client?._id || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await userService.deleteUser(userId, token)
      setUsers(users.filter(user => user._id !== userId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        // Update existing user
        const data = await userService.updateUser(
          editingUser._id,
          { ...newUser, password: newUser.password || undefined },
          token
        )
        
        // If the user has a client ID but not the full client object, fetch the client details
        const updatedUser = {
          ...data,
          client: data.client && typeof data.client === 'string' 
            ? clients.find(c => c._id === data.client)
            : data.client
        }

        setUsers(users.map(user => 
          user._id === editingUser._id ? updatedUser : user
        ))
      } else {
        // Create new user
        const data = await userService.createUser(newUser, token)
        setUsers([...users, data])
      }

      setIsModalOpen(false)
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: '',
        client: ''
      })
      setEditingUser(null)
    } catch (err) {
      setError(err.message)
    }
  }

  // Add a function to determine if client field should be shown
  const shouldShowClientField = () => {
    if (editingUser) {
      // When editing, check the current role of the user being edited
      const roleId = newUser.role
      const role = roles.find(r => r._id === roleId)
      return role && isClientRole(role.name)
    } else {
      // For new users, check the selected role
      const selectedRole = roles.find(r => r._id === newUser.role)
      return selectedRole && isClientRole(selectedRole.name)
    }
  }

  if (!token) return <div>Please log in</div>
  if (loading) return <Loader />
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
            {canCreateUser && (
              <button className="create-button" onClick={() => setIsModalOpen(true)}>
                Create User
              </button>
            )}
          </div>
        </div>
        <div className="content-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                {showClientColumn && <th>Client</th>}
                {(canEditUser || canDeleteUser) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role ? user.role.name : 'No role assigned'}</td>
                  {showClientColumn && (
                    <td>{user.client ? user.client.name : '-'}</td>
                  )}
                  {(canEditUser || canDeleteUser) && (
                    <td className="action-buttons">
                      {canEditUser && (
                        <button 
                          className="edit-button"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                      )}
                      {canDeleteUser && (
                        <button 
                          className="delete-button"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Only render modal if user has create permission */}
      {canCreateUser && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingUser(null)
            setNewUser({
              name: '',
              email: '',
              password: '',
              role: '',
              client: ''
            })
          }}
          title={editingUser ? 'Edit User' : 'Create New User'}
        >
          <form onSubmit={handleSubmit} className="create-user-form">
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
              <label htmlFor="password">
                Password {editingUser && '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                id="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required={!editingUser} // Only required for new users
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={newUser.role}
                onChange={(e) => {
                  setNewUser({ 
                    ...newUser, 
                    role: e.target.value,
                    // Clear client selection when role changes
                    client: '' 
                  })
                }}
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

            {/* Update the client field visibility check */}
            {shouldShowClientField() && (
              <div className="form-group">
                <label htmlFor="client">Client</label>
                <select
                  id="client"
                  value={newUser.client}
                  onChange={(e) => setNewUser({ ...newUser, client: e.target.value })}
                  className="select-single"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingUser(null)
                  setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    role: '',
                    client: ''
                  })
                }}
              >
                Cancel
              </button>
              <button type="submit" className="submit-button">
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default Users 
