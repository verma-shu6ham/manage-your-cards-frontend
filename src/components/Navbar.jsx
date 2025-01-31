import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "./Navbar.css"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!user) return null

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Credit Card Manager
      </Link>
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">
          Home
        </Link>
        <Link to="/transactions" className="navbar-item">
          Transactions
        </Link>
        <Link to="/profile" className="navbar-item">
          Profile
        </Link>
        <button onClick={handleLogout} className="navbar-item">
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar

