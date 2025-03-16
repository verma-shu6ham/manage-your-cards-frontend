import React, { useState, useEffect } from 'react';
import { withErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { formatDateTime } from '../../utils/mathUtils';
import './OfflineAlert.css';

const OfflineAlert = () => {
  const { locale } = useAuth();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState(localStorage.getItem('lastOnlineTimestamp'));
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowAlert(true);
      // Hide "Back Online" message after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
    };

    const handleOffline = () => {
      if (locale) {
        const { date, time } = formatDateTime(locale, new Date().toISOString())
        localStorage.setItem('lastOnlineTimestamp', `${date} ${time}`);
        setLastOnlineTime(`${date} ${time}`);
      }
      setIsOffline(true);
      setShowAlert(true);
      // Keep offline message visible
    };

    const handleStorageChange = () => {
      const newTimestamp = localStorage.getItem('lastOnlineTimestamp');
      setLastOnlineTime(newTimestamp);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorageChange);

    // Show initial state if offline
    if (isOffline) {
      setShowAlert(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isOffline]);

  if (!showAlert) return null;

  const formatLastOnlineTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getAlertContent = () => {
    if (!isOffline) {
      window.location.reload();
      return {
        className: 'alert-success',
        message: '✓ Back Online! Updating data...'
      };
    }
    const lastOnlineMessage = lastOnlineTime
      ? ` (Last connected: ${lastOnlineTime})`
      : '';

    return {
      className: 'alert-warning',
      message: `⚠ You're offline. Showing cached data${lastOnlineMessage}`
    };
  };

  const { className, message } = getAlertContent();

  return (
    <div className={`offline-alert ${className}`}>
      {message}
    </div>
  );
};

export default withErrorBoundary(OfflineAlert);
