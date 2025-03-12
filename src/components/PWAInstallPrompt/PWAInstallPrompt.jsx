import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext/ThemeContext';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const { theme } = useTheme();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if the device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if the device is Android
    const isAndroidDevice = /Android/.test(navigator.userAgent);
    setIsAndroid(isAndroidDevice);

    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                           window.matchMedia('(display-mode: fullscreen)').matches ||
                           window.navigator.standalone === true;

    // Only show the prompt if it's a mobile device and not already installed
    if ((isIOSDevice || isAndroidDevice) && !isAppInstalled) {
      // For iOS, we'll show our custom prompt immediately
      if (isIOSDevice) {
        // Wait a bit before showing the prompt to not interrupt initial page load
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
      }
    }

    // For Android/Chrome, listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom prompt
      setShowPrompt(true);
    });

    // Clean up event listener
    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt for Android
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // We no longer need the prompt. Clear it up.
      setDeferredPrompt(null);
      // Hide our custom prompt
      setShowPrompt(false);
    }
  };

  const closePrompt = () => {
    setShowPrompt(false);
    // Store in localStorage that the user has dismissed the prompt
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  // If the user has previously dismissed the prompt, don't show it again
  useEffect(() => {
    const hasUserDismissedPrompt = localStorage.getItem('pwaPromptDismissed') === 'true';
    if (hasUserDismissedPrompt) {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-prompt-content">
        <div className="pwa-prompt-header">
          <img src="/logo192.png" alt="CreditSetu Logo" className="pwa-logo" />
          <h3>Add CreditSetu to Home Screen</h3>
          <button className="pwa-close-btn" onClick={closePrompt}>×</button>
        </div>
        
        <div className="pwa-prompt-body">
          <p>Install CreditSetu for a better experience!</p>
          
          {isIOS && (
            <div className="pwa-instructions">
              <p>To install this app on your iOS device:</p>
              <ol>
                <li>Tap the <strong>Share</strong> button <span className="ios-share-icon">⬆️</span> at the bottom of your screen</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong> in the top right corner</li>
              </ol>
            </div>
          )}
          
          {isAndroid && (
            <div className="pwa-instructions">
              <p>Install this app on your device:</p>
              <button className="pwa-install-btn" onClick={handleInstallClick}>
                Add to Home Screen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
