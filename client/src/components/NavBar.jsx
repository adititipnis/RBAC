import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './NavBar.css'

function NavBar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link'
  }

  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
        <div className="nav-links">
          {user.role.name === 'Super Admin' && (
            <Link to="/users" className={isActive('/users')}>User Management</Link>
          )}
        </div>
      </div>
      <div className="nav-right">
        <span className="user-name">{user.name}</span>
        <button className="logout-button" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  )
}

export default NavBar 
