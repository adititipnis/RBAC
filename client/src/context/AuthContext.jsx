import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Memoize permissions for performance
  const permissions = useMemo(() => {
    return user?.permissions || {}
  }, [user?.permissions])

  // Check permissions without passing user object
  const hasPermission = (pageType, action = 'read') => {
    if (!permissions[pageType]) return false
    return permissions[pageType].includes(action)
  }

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error parsing stored user:', error.message)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData) => {
    setUser(userData.user)
    setToken(userData.token)
    localStorage.setItem('user', JSON.stringify(userData.user))
    localStorage.setItem('token', userData.token)
    navigate('/dashboard')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    hasPermission
  }), [user, token, loading, permissions])

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 
