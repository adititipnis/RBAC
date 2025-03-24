import Modal from './Modal'
import { useAuth } from '../context/AuthContext'

function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
  newUser,
  setNewUser,
  roles,
  clients
}) {
  // Get the current user from context instead of props
  const { user } = useAuth()
  
  // Filter available roles based on current user's hierarchy level
  const availableRoles = roles.filter(role => {
    // Get the current user's hierarchy level from the auth context
    const currentUserHierarchyLevel = user?.role?.hierarchyLevel || 0;
    
    if (editingUser) {
      // When editing, show the user's current role and roles with higher hierarchy level
      return role._id === newUser.role || role.hierarchyLevel > currentUserHierarchyLevel;
    }
    // When creating, only show roles with higher hierarchy level than current user
    return role.hierarchyLevel > currentUserHierarchyLevel;
  })

  // Helper function to determine if client field should be shown
  const shouldShowClientField = () => {
    const selectedRole = roles.find(r => r._id === newUser.role)
    if (!selectedRole) return false
    
    // Client-scoped roles have hierarchy level 2 or higher
    return selectedRole.hierarchyLevel >= 2
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUser ? 'Edit User' : 'Create New User'}
    >
      <form onSubmit={onSubmit} className="create-user-form">
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
            required={!editingUser}
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={newUser.role}
            onChange={(e) => {
              const roleId = e.target.value;
              const selectedRole = roles.find(r => r._id === roleId);
              const requiresClient = selectedRole && selectedRole.hierarchyLevel >= 2;
              
              setNewUser({ 
                ...newUser, 
                role: roleId,
                // Clear client if switching to a non-client role
                client: requiresClient ? newUser.client : ''
              });
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
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button">
            {editingUser ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateUserModal 
