import React, { useState, useEffect } from 'react';
import { withErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import './UpdateAlert.css';

const UpdateAlert = () => {
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // Listen for the custom event from the service worker
    const handleServiceWorkerUpdate = (event) => {
      const registration = event.detail;
      setWaitingWorker(registration.waiting);
      setShowUpdateAlert(true);
    };

    window.addEventListener('serviceWorkerUpdate', handleServiceWorkerUpdate);

    return () => {
      window.removeEventListener('serviceWorkerUpdate', handleServiceWorkerUpdate);
    };
  }, []);

  const updateServiceWorker = () => {
    if (waitingWorker) {
      // Send a message to the waiting service worker to skip waiting and become active
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to load the new version
      waitingWorker.addEventListener('statechange', event => {
        if (event.target.state === 'activated') {
          window.location.reload();
        }
      });
    }
  };

  if (!showUpdateAlert) {
    return null;
  }

  return (
    <div className="update-alert">
      <div className="update-alert-content">
        <div className="update-alert-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <div className="update-alert-message">
          <strong>New version available!</strong>
          <p>Update now to get the latest features and improvements.</p>
        </div>
        <div className="update-alert-actions">
          <button 
            className="update-alert-update-btn" 
            onClick={updateServiceWorker}
          >
            Update Now
          </button>
          <button 
            className="update-alert-close" 
            onClick={() => setShowUpdateAlert(false)}
            aria-label="Close alert"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(UpdateAlert);
