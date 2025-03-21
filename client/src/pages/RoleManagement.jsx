import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import Toast from '../components/Toast'
import roleService from '../services/roleService'
import Loader from '../components/Loader'
import './RoleManagement.css'

function RoleManagement() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, token } = useAuth()
  const [editingStates, setEditingStates] = useState({})
  const [toast, setToast] = useState(null)
  const [savingRoles, setSavingRoles] = useState({})
  
  // Define available pages
  const pages = [
    'userManagement',
    'roleManagement',
    'permissionManagement',
    'clientManagement',
    'diagnostic',
    'dashboard',
    'report'
  ]

  useEffect(() => {
    fetchRoles()
  }, [token, user.role.hierarchyLevel])

  const fetchRoles = async () => {
    try {
      const rolesData = await roleService.getRoles(token)
      
      // Filter roles based on hierarchy
      const availableRoles = rolesData.filter(role => 
        role.hierarchyLevel > user.role.hierarchyLevel
      )

      setRoles(availableRoles)
      // Initialize editing states
      const states = {}
      availableRoles.forEach(role => {
        states[role._id] = { ...role }
      })
      setEditingStates(states)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handlePermissionChange = (roleId, page, action) => {
    setEditingStates(prev => {
      const role = { ...prev[roleId] }
      const updatedPermissions = [...role.permissions]
      const pagePermissionIndex = updatedPermissions.findIndex(p => p.pageType === page)

      if (pagePermissionIndex >= 0) {
        // Create a new object to ensure state update
        const pagePermission = { ...updatedPermissions[pagePermissionIndex] }
        if (pagePermission.allowedActions.includes(action)) {
          // Remove the action
          pagePermission.allowedActions = pagePermission.allowedActions.filter(a => a !== action)
          if (pagePermission.allowedActions.length === 0) {
            // Remove the entire permission object if no actions left
            updatedPermissions.splice(pagePermissionIndex, 1)
          } else {
            // Update with the modified permission object
            updatedPermissions[pagePermissionIndex] = pagePermission
          }
        } else {
          // Add the action to a new array
          pagePermission.allowedActions = [...pagePermission.allowedActions, action]
          updatedPermissions[pagePermissionIndex] = pagePermission
        }
      } else {
        // Add new page permission
        updatedPermissions.push({
          pageType: page,
          allowedActions: [action]
        })
      }

      return {
        ...prev,
        [roleId]: {
          ...role,
          permissions: updatedPermissions
        }
      }
    })
  }

  const handleSave = async (roleId) => {
    setSavingRoles(prev => ({ ...prev, [roleId]: true }))
    try {
      const updatedRole = await roleService.updateRole(
        roleId, 
        editingStates[roleId], 
        token
      )
      
      setRoles(roles.map(role => 
        role._id === roleId ? updatedRole : role
      ))
      
      setToast({
        message: 'Role permissions updated successfully',
        type: 'success'
      })
    } catch (err) {
      setToast({
        message: err.message || 'Failed to update role',
        type: 'error'
      })
    } finally {
      setSavingRoles(prev => ({ ...prev, [roleId]: false }))
    }
  }

  const renderPermissionsTable = (role) => {
    const editingRole = editingStates[role._id]
    if (!editingRole) return null

    return (
      <table className="permissions-table">
        <thead>
          <tr>
            <th>Page</th>
            <th>Create</th>
            <th>Read</th>
            <th>Update</th>
            <th>Delete</th>
            <th>Search</th>
          </tr>
        </thead>
        <tbody>
          {pages.map(page => {
            const pagePermissions = editingRole.permissions.find(p => p.pageType === page)?.allowedActions || []
            return (
              <tr key={page}>
                <td>{page}</td>
                {['create', 'read', 'update', 'delete', 'search'].map(action => (
                  <td key={action} className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={pagePermissions.includes(action)}
                      onChange={() => handlePermissionChange(role._id, page, action)}
                    />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  if (loading) return <Loader />
  if (error) return <div>Error: {error}</div>

  return (
    <div className="layout">
      <NavBar />
      <div className="role-management-container">
        <div className="page-header">
          <div className="header-content">
            <h2>Role Management</h2>
            <p>Manage system roles and their permissions</p>
          </div>
        </div>

        <div className="roles-grid">
          {roles.map(role => (
            <div key={role._id} className="role-card">
              <div className="role-header">
                <h3>{role.name}</h3>
                <span className="hierarchy-level">Level: {role.hierarchyLevel}</span>
              </div>
              <div className="role-permissions">
                {renderPermissionsTable(role)}
              </div>
              <div className="role-actions">
                <button 
                  className={`save-button ${savingRoles[role._id] ? 'saving' : ''}`}
                  onClick={() => handleSave(role._id)}
                  disabled={savingRoles[role._id]}
                >
                  {savingRoles[role._id] ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default RoleManagement 
