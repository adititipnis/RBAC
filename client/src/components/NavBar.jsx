import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './NavBar.css'

function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <Link to="/dashboard" className="nav-brand">Dashboard</Link>
        <div className="nav-links">
          {user.roles.includes('Super Admin') && (
            <Link to="/users" className="nav-link">User Management</Link>
          )}
          {/* Add more nav links here */}
        </div>
      </div>
      <div className="nav-right">
        <span className="user-name">{user.name}</span>
        <button className="logout-button" onClick={logout}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}

export default NavBar 