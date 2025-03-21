import NavBar from '../components/NavBar'
import './Diagnostics.css'

function Diagnostics() {
  return (
    <div className="layout">
      <NavBar />
      <div className="diagnostics-container">
        <div className="page-header">
          <h2>Diagnostics</h2>
          <p>System diagnostics and monitoring</p>
        </div>
        <div className="content-card">
          <div className="placeholder-content">
            <h3>Coming Soon</h3>
            <p>System diagnostics features will be available here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Diagnostics 