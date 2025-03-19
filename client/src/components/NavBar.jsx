import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './NavBar.css'

const NavBar = () => {
  const { user, logout, hasPermission } = useAuth()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">RBAC Demo</div>
      <ul className="nav-links">
        {hasPermission('dashboard') && (
          <li>
            <Link to="/dashboard" className={isActive('/dashboard')}>
              Dashboard
            </Link>
          </li>
        )}
        {hasPermission('userManagement') && (
          <li>
            <Link to="/users" className={isActive('/users')}>
              Users
            </Link>
          </li>
        )}
        {hasPermission('roleManagement') && (
          <li>
            <Link to="/roles" className={isActive('/roles')}>
              Roles
            </Link>
          </li>
        )}
      </ul>
      <div className="nav-user">
        <span>{user?.name}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default NavBar 
