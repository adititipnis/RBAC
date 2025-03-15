import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard-container">
      <nav className="nav-bar">
        <h1>Dashboard</h1>
        <button className="logout-button" onClick={logout}>
          Sign Out
        </button>
      </nav>
      <div className="welcome-section">
        <h2>Welcome back, {user.username}!</h2>
        <p>{user.role === 'admin' ? 'Administrator' : 'User'}</p>
      </div>
      {/* Add more dashboard content here */}
    </div>
  )
}

export default Dashboard 
