import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { useTheme } from '../../contexts/ThemeContext/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faExchangeAlt,
  faCreditCard,
  faCalendarAlt,
  faBars,
  faTimes,
  faSignInAlt,
  faUserPlus,
  faSun,
  faMoon,
  faUser,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTransactionsDropdown = (e) => {
    e.stopPropagation();
    setIsTransactionsOpen(!isTransactionsOpen);
  };

  const handleOptionSelect = () => {
    setIsTransactionsOpen(false);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest('.navbar-dropdown')) {
        setIsTransactionsOpen(false);
      }
    };

    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  return (
    <>
      <div className="navbar-wrapper">
        <div className="navbar-container">
          <Link to={user ? "/dashboard" : "/dashboard"} className="navbar-brand">CreditSetu</Link>

          {/* Desktop Navigation */}
          <div className="navbar-desktop-nav">
            {user ? (
              <>
                <Link to="/dashboard" className="navbar-link">
                  <FontAwesomeIcon icon={faHome} className="navbar-icon" />
                  Dashboard
                </Link>
                <div className={`navbar-dropdown-item ${isTransactionsOpen ? 'navbar-open' : ''}`} onClick={toggleTransactionsDropdown}>
                  <span className="navbar-link">
                    <FontAwesomeIcon icon={faExchangeAlt} className="navbar-icon" />
                    Transactions
                  </span>
                  <div className={`navbar-dropdown-content ${isTransactionsOpen ? 'navbar-show' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <Link to="/transactions" className="navbar-dropdown-link" onClick={handleOptionSelect}>
                      <FontAwesomeIcon icon={faCreditCard} className="navbar-icon" />
                      All Cards
                    </Link>
                    <Link to="/monthlyExpenseTxs" className="navbar-dropdown-link" onClick={handleOptionSelect}>
                      <FontAwesomeIcon icon={faCalendarAlt} className="navbar-icon" />
                      Monthly Expense
                    </Link>
                  </div>
                </div>
                <Link to="/profile" className="navbar-link">
                  <FontAwesomeIcon icon={faUser} className="navbar-icon" />
                  Profile
                </Link>
                <button className="navbar-link" onClick={logout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="navbar-icon" />
                  Logout
                </button>
                <button className="navbar-theme-toggle" onClick={toggleTheme}>
                  <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link">
                  <FontAwesomeIcon icon={faSignInAlt} className="navbar-icon" />
                  Sign In
                </Link>
                <Link to="/signup" className="navbar-link navbar-signup-btn">
                  <FontAwesomeIcon icon={faUserPlus} className="navbar-icon" />
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="navbar-mobile-controls">
            <button className="navbar-theme-toggle" onClick={toggleTheme}>
              <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
            </button>
            <button className="navbar-menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation menu">
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`navbar-sidebar ${isMenuOpen ? 'navbar-open' : ''}`}>
        <div className="navbar-sidebar-header">
          <button className="navbar-close-sidebar" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="navbar-sidebar-content">
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-sidebar-link" onClick={handleOptionSelect}>
                <FontAwesomeIcon icon={faHome} className="navbar-sidebar-icon" />
                Dashboard
              </Link>
              <div className={`navbar-sidebar-dropdown ${isTransactionsOpen ? 'navbar-open' : ''}`} onClick={toggleTransactionsDropdown}>
                <span className="navbar-sidebar-link">
                  <FontAwesomeIcon icon={faExchangeAlt} className="navbar-sidebar-icon" />
                  Transactions
                </span>
                <div className={`navbar-sidebar-dropdown-content ${isTransactionsOpen ? 'navbar-show' : ''}`}>
                  <Link to="/transactions" className="navbar-sidebar-link navbar-submenu" onClick={handleOptionSelect}>
                    <FontAwesomeIcon icon={faCreditCard} className="navbar-sidebar-icon" />
                    All Cards
                  </Link>
                  <Link to="/monthlyExpenseTxs" className="navbar-sidebar-link navbar-submenu" onClick={handleOptionSelect}>
                    <FontAwesomeIcon icon={faCalendarAlt} className="navbar-sidebar-icon" />
                    Monthly Expense
                  </Link>
                </div>
              </div>
              <Link to="/profile" className="navbar-sidebar-link" onClick={handleOptionSelect}>
                <FontAwesomeIcon icon={faUser} className="navbar-sidebar-icon" />
                Profile
              </Link>
              <button className="navbar-sidebar-link navbar-logout" onClick={() => { logout(); handleOptionSelect(); }}>
                <FontAwesomeIcon icon={faSignOutAlt} className="navbar-sidebar-icon" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-sidebar-link" onClick={handleOptionSelect}>Sign In</Link>
              <Link to="/signup" className="navbar-sidebar-link navbar-signup-btn" onClick={handleOptionSelect}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
