import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

function Home() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
  const { user, logout } = useAuth()

  const fetchWelcomeMessage = async () => {
    try {
      setError(null)
      const data = await api.fetchWelcomeMessage()
      setMessage(data.message)
    } catch {
      setError('Error connecting to server')
    }
  }

  return (
    <div className="app-container">
      <div className="user-info">
        <p>Welcome, {user.username}!</p>
        <button onClick={logout}>Logout</button>
      </div>
      <h1>React + Express App</h1>
      <button onClick={fetchWelcomeMessage}>
        Fetch Welcome Message
      </button>
      {message && !error && <p>{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default Home 
