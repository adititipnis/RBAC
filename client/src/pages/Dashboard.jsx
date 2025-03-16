import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

function Dashboard() {
  const { user, logout } = useAuth()

  const getDisplayRole = (roles) => {
    if (!roles?.length) return 'No Role'
    return roles[0] || 'No Role'
  }

  return (
    <div className="dashboard-container">
      <nav className="nav-bar">
        <h1>Dashboard</h1>
        <button className="logout-button" onClick={logout}>
          Sign Out
        </button>
      </nav>
      <div className="welcome-section">
        <h2>Welcome back, {user.name}!</h2>
        <p>Role: {getDisplayRole(user.roles)}</p>
      </div>
    </div>
  )
}

export default Dashboard 
