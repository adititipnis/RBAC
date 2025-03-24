import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import userService from '../services/userService'
import roleService from '../services/roleService'
import clientService from '../services/clientService'
import CreateUserModal from '../components/CreateUserModal'
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
    } catch (error) {
      setError(error.message)
      // Optional: Show a toast or notification
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Prepare user data - ensure client is just the ID
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password || undefined,
        role: newUser.role,
        // Only include client if it's set and ensure it's just the ID string
        ...(newUser.client && { client: newUser.client })
      }

      console.log('Submitting user data:', userData) // Debug log

      if (editingUser) {
        const data = await userService.updateUser(
          editingUser._id,
          userData,
          token
        )
        
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
        const data = await userService.createUser(userData, token)
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
    } catch (error) {
      console.error('Error submitting user:', error.message)
      setError(error.message)
      // Optional: Show an error in the form
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: '',
      client: ''
    })
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
        <CreateUserModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editingUser={editingUser}
          newUser={newUser}
          setNewUser={setNewUser}
          roles={roles}
          clients={clients}
        />
      )}
    </div>
  )
}

export default Users 
