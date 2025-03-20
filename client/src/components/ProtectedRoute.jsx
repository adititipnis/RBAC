import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ pageType, children }) => {
  const { user, hasPermission } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (pageType && !hasPermission(pageType)) {
    console.log('Permission denied for:', pageType)
    console.log('User permissions:', user.permissions)
    return (
      <div className="error-container">
        <h1>404</h1>
        <p>Page not found</p>
      </div>
    )
  }

  return children
} 
