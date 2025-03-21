import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import './NavBar.css'

function NavBar() {
  const { user, logout, hasPermission } = useAuth()
  const location = useLocation()
  const [showAdminMenu, setShowAdminMenu] = useState(false)

  // Check if user has access to any admin pages
  const hasAdminAccess = hasPermission('userManagement') || hasPermission('roleManagement')

  return (
    <nav className="navbar">
      <div className="nav-brand">RBAC System</div>
      <ul className="nav-links">
        {hasPermission('dashboard') && (
          <li>
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
        )}
        {hasPermission('diagnostic') && (
          <li>
            <Link 
              to="/diagnostics" 
              className={location.pathname === '/diagnostics' ? 'active' : ''}
            >
              Diagnostics
            </Link>
          </li>
        )}
        {hasPermission('report') && (
          <li>
            <Link 
              to="/reports" 
              className={location.pathname === '/reports' ? 'active' : ''}
            >
              Reports
            </Link>
          </li>
        )}
        {hasAdminAccess && (
          <li className="dropdown">
            <button 
              className={`dropdown-button ${showAdminMenu ? 'active' : ''}`}
              onClick={() => setShowAdminMenu(!showAdminMenu)}
            >
              Admin
            </button>
            {showAdminMenu && (
              <ul className="dropdown-menu">
                {hasPermission('userManagement') && (
                  <li>
                    <Link 
                      to="/users" 
                      className={location.pathname === '/users' ? 'active' : ''}
                    >
                      Users
                    </Link>
                  </li>
                )}
                {hasPermission('roleManagement') && (
                  <li>
                    <Link 
                      to="/roles" 
                      className={location.pathname === '/roles' ? 'active' : ''}
                    >
                      Roles
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </li>
        )}
      </ul>
      <div className="nav-user">
        <span>{user.name}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default NavBar 
