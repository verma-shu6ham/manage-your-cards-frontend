import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext/AuthContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Home from './pages/Home/Home';
import CardDetails from './pages/CardDetails/CardDetails';
import Transactions from './pages/Transactions/Transactions';
import Profile from './pages/Profile/Profile';
import MonthlyExpense from './pages/MonthlyExpense/MonthlyExpense';
import PWAInstallPrompt from './components/PWAInstallPrompt/PWAInstallPrompt';
import OfflineAlert from './components/OfflineAlert/OfflineAlert';
import UpdateAlert from './components/UpdateAlert/UpdateAlert';
import { ThemeProvider } from './contexts/ThemeContext/ThemeContext';
import { TooltipContext } from './contexts/TooltipContext';
import './App.css';
import './ScrollStyles.css';

function App() {
  const [tooltipContent, setTooltipContent] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipContext.Provider value={[setTooltipContent, setShowTooltip, tooltipContent, showTooltip]}>
          <Router>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={<PrivateRoute element={<Home />} />} />
                  <Route path="/card/:id" element={<PrivateRoute element={<CardDetails />} />} />
                  <Route path="/transactions" element={<PrivateRoute element={<Transactions />} />} />
                  <Route path="/monthlyExpenseTxs" element={<PrivateRoute element={<MonthlyExpense />} />} />
                  <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />

                  {/* Default redirect */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </main>
              {/* PWA Install Prompt */}
              <PWAInstallPrompt />
              {/* Offline Alert */}
              <OfflineAlert />
              {/* Update Alert */}
              <UpdateAlert />
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
