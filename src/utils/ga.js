// Google Analytics 4 Implementation
let initialized = false;

// Initialize GA4
export const initGA = () => {
  if (initialized || !process.env.REACT_APP_GA_MEASUREMENT_ID) return;
  
  // Load gtag.js script dynamically
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
    send_page_view: false, // Disable automatic page views
    debug_mode: false
  });

  initialized = true;
};

// Track page views
export const trackPageView = (path) => {
  if (!initialized) return;
  const pageViewData = {
    page_path: path,
    page_title: path.split('/')[1]
  };

  window.gtag('event', 'page_view', pageViewData);
};

// Track custom events
export const trackEvent = ({
  action,
  category,
  label,
  value
}) => {
  if (!initialized) return;

  const eventData = {
    event_category: category,
    event_label: label,
    value: value
  };

  window.gtag('event', action, eventData);
};

// Set user ID
export const setUserId = (userId) => {
  if (!initialized || !userId) return;
  window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
    user_id: userId
  });
};

// Track referral sources
export const trackReferral = () => {
  if (!initialized) return;
  const referrer = document.referrer;
  if (referrer) {
    trackEvent({
      action: 'referral',
      category: 'engagement',
      label: referrer,
      value: 1
    });
  }
};

// Track engagement time
let startTime = null;
let engagementInterval = null;

export const trackEngagementTime = () => {
  if (!initialized) return;
  
  startTime = Date.now();
  
  // Clear any existing interval
  if (engagementInterval) {
    clearInterval(engagementInterval);
  }

  // Send engagement time every minute
  engagementInterval = setInterval(() => {
    const engagementTime = Math.floor((Date.now() - startTime) / 1000); // in seconds
    trackEvent({
      action: 'engagement_time',
      category: 'engagement',
      label: 'time_on_site',
      value: engagementTime
    });
  }, 60000); // every minute

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    if (engagementInterval) {
      clearInterval(engagementInterval);
      const finalEngagementTime = Math.floor((Date.now() - startTime) / 1000);
      trackEvent({
        action: 'final_engagement_time',
        category: 'engagement',
        label: 'time_on_site',
        value: finalEngagementTime
      });
    }
  });
};

// Best practices for tracking common interactions
export const trackButtonClick = (buttonName) => {
  trackEvent({
    action: 'button_click',
    category: 'interaction',
    label: buttonName,
    value: 1
  });
};

export const trackFormSubmission = (formName, success = true) => {
  trackEvent({
    action: 'form_submission',
    category: 'interaction',
    label: `${formName}_${success ? 'success' : 'failure'}`,
    value: 1
  });
};

export const trackOutboundLink = (url) => {
  trackEvent({
    action: 'outbound_link',
    category: 'navigation',
    label: url,
    value: 1
  });
};
