import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext/ThemeContext';
import './OfflineAlert.css';

const OfflineAlert = () => {
  const { theme } = useTheme();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine);
    if (!navigator.onLine) {
      setShowAlert(true);
    }

    // Add event listeners for online/offline status
    const handleOnline = () => {
      setIsOffline(false);
      // Keep the alert visible for a moment so user can see we're back online
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert) {
    return null;
  }

  return (
    <div className={`offline-alert ${isOffline ? 'offline' : 'online'}`}>
      <div className="offline-alert-content">
        <div className="offline-alert-icon">
          {isOffline ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
              <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
          )}
        </div>
        <div className="offline-alert-message">
          {isOffline ? 'You are offline. Some features may be unavailable.' : 'You are back online!'}
        </div>
        <button 
          className="offline-alert-close" 
          onClick={() => setShowAlert(false)}
          aria-label="Close alert"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default OfflineAlert;
