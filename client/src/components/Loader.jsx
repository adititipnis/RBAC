import './Loader.css'

function Loader() {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="loader-shield">
          <div className="loader-circle"></div>
        </div>
      </div>
      <p className="loader-text">Loading</p>
    </div>
  )
}

export default Loader 