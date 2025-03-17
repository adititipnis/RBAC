import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import './Dashboard.css'

function Dashboard() {
  const { user } = useAuth()

  const getDisplayRole = (role) => {
    if (!role) return 'No Role'
    return role.name || 'No Role'
  }

  return (
    <div className="layout">
      <NavBar />
      <div className="dashboard-container">
        <div className="welcome-section">
          <h2>Welcome back, {user.name}!</h2>
          <p>Role: {getDisplayRole(user.role)}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 
