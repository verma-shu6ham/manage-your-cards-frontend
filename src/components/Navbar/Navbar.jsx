import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext/AuthContext"
import { useTheme } from '../../contexts/ThemeContext/ThemeContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faSun, 
  faMoon, 
  faBars, 
  faTimes, 
  faSignOutAlt,
  faHome,
  faExchangeAlt,
  faUser
} from '@fortawesome/free-solid-svg-icons'
import "./Navbar.css"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  if (!user) return null

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        CreditSetu
      </Link>
      <div className="navbar-controls">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
        </button>
        <button 
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </button>
      </div>
      <div className={`navbar-menu ${isMenuOpen ? 'show' : ''}`}>
        <Link to="/" className="navbar-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faHome} className="nav-icon" />
          Home
        </Link>
        <Link to="/transactions" className="navbar-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faExchangeAlt} className="nav-icon" />
          Transactions
        </Link>
        <Link to="/profile" className="navbar-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faUser} className="nav-icon" />
          Profile
        </Link>
        <button 
          onClick={() => {
            handleLogout();
            setIsMenuOpen(false);
          }} 
          className="navbar-item logout-btn"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar

