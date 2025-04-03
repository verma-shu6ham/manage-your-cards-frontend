import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext/AuthContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import PublicRoute from './components/PublicRoute/PublicRoute';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import VerifyEmail from './pages/Auth/VerifyEmail';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Home from './pages/Home/Home';
import CardDetails from './pages/CardDetails/CardDetails';
import Transactions from './pages/Transactions/Transactions';
import CreditCardsTransactions from './pages/CreditCardsTransactions/CreditCardsTransactions';
import Profile from './pages/Profile/Profile';
import MonthlyExpense from './pages/MonthlyExpense/MonthlyExpense';
import PWAInstallPrompt from './components/PWAInstallPrompt/PWAInstallPrompt';
import OfflineAlert from './components/OfflineAlert/OfflineAlert';
import UpdateAlert from './components/UpdateAlert/UpdateAlert';
import Landing from './pages/Landing/Landing';
import { ThemeProvider } from './contexts/ThemeContext/ThemeContext';
import { TooltipContext } from './contexts/TooltipContext';
import './App.css';
import './ScrollStyles.css';

// NavigationHandler Component to handle navbar visibility
const NavigationHandler = ({ children }) => {
  const [showNavbar, setShowNavbar] = useState(true);
  
  // This component will handle showing or hiding navbar based on the path
  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
    
        {/* Public Routes - All show navbar */}
        <Route path="/" element={<PublicRoute element={<Landing setShowNavbar={setShowNavbar} />} />} />
        <Route path="/login" element={<PublicRoute element={<Login setShowNavbar={() => setShowNavbar(true)} />} />} />
        <Route path="/signup" element={<PublicRoute element={<Signup setShowNavbar={() => setShowNavbar(true)} />} />} />
        <Route path="/verify-email/:token" element={<PublicRoute element={<VerifyEmail setShowNavbar={() => setShowNavbar(true)} />} />} />
        <Route path="/forgot-password" element={<PublicRoute element={<ForgotPassword setShowNavbar={() => setShowNavbar(true)} />} />} />
        <Route path="/reset-password/:token" element={<PublicRoute element={<ResetPassword setShowNavbar={() => setShowNavbar(true)} />} />} />

        {/* Protected Routes - All show navbar */}
        <Route path="/dashboard" element={<PrivateRoute element={<Home setShowNavbar={() => setShowNavbar(true)} />} />} />
        <Route path="/card/:id" element={<PrivateRoute element={<CardDetails setShowNavbar={() => setShowNavbar(true)} />} />} />
        <Route path="/transactions" element={<PrivateRoute element={<Transactions setShowNavbar={() => setShowNavbar(true)} />} />} />
        <Route path="/monthlyExpenseTxs" element={<PrivateRoute element={<MonthlyExpense setShowNavbar={() => setShowNavbar(true)} />} />} />
        <Route path="/creditCardsTransactions" element={<PrivateRoute element={<CreditCardsTransactions setShowNavbar={() => setShowNavbar(true)} />} />} />
        <Route path="/profile" element={<PrivateRoute element={<Profile setShowNavbar={() => setShowNavbar(true)} />} />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {children}
    </>
  );
};

function App() {
  const [tooltipContent, setTooltipContent] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipContext.Provider value={[setTooltipContent, setShowTooltip, tooltipContent, showTooltip]}>
          <Router>
            <div className="app">
              <main className="main-content">
                <NavigationHandler>
                  {/* PWA Install Prompt */}
                  <PWAInstallPrompt />
                  {/* Offline Alert */}
                  <OfflineAlert />
                  {/* Update Alert */}
                  <UpdateAlert />
                </NavigationHandler>
              </main>
            </div>
          </Router>
          {showTooltip && (
            <div className="tooltip-overlay" onClick={() => setShowTooltip(false)}>
              <div className="tooltip-popup" onClick={e => e.stopPropagation()}>
                <p>{tooltipContent}</p>
                <button
                  className="close-tooltip"
                  onClick={() => setShowTooltip(false)}
                  aria-label="Close tooltip"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </TooltipContext.Provider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
