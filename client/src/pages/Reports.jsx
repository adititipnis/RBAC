import NavBar from '../components/NavBar'
import './Reports.css'

function Reports() {
  return (
    <div className="layout">
      <NavBar />
      <div className="reports-container">
        <div className="page-header">
          <h2>Reports</h2>
          <p>System reports and analytics</p>
        </div>
        <div className="content-card">
          <div className="placeholder-content">
            <h3>Coming Soon</h3>
            <p>Report generation features will be available here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports 