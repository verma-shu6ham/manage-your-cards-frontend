// This is the service worker for CreditSetu PWA

// console.log('[Service Worker] Starting service worker initialization...');

const CACHE_NAME = 'creditsetu-v1';
const DYNAMIC_CACHE = 'creditsetu-dynamic-v1';

// Static assets to cache on install
const urlsToCache = [
  '/',
  '/dashboard',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/login',
  '/signup',
  '/profile',
  '/cards',
  '/transactions',
  '/monthly-expense',
  '/static/js/',
  '/static/css/',
  '/static/media/'
];

// API endpoints to cache
const API_ROUTES = [
  // Cards endpoints
  '/api/cards/all-cards',
  '/api/cards/',  // This will match individual card requests like /api/cards/123

  // Transaction endpoints
  '/api/transactions',
  '/api/transactions/monthly-spending',
  '/api/transactions/spending-summary',

  // User endpoints
  '/api/user/profile',
  '/api/user/categories'
];

// Helper function to determine if a request is a GET request
const isGetRequest = (request) => request.method === 'GET';

// Helper function to check if URL is an API request
const isApiRequest = (url) => {
  return API_ROUTES.some(route => {
    if (route.endsWith('/')) {
      return url.pathname.startsWith(route);
    }
    return url.pathname.includes(route);
  });
};

// Helper function to store the last online timestamp
const updateLastOnlineTimestamp = () => {
  const timestamp = new Date().toISOString();
  // console.log('[Service Worker] Updating last online timestamp:', timestamp);
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'LAST_ONLINE_UPDATE',
        timestamp: timestamp
      });
    });
  });
};

// Helper function to log cache operations
const logCacheOperation = (type, url, status = null) => {
  console.log(`[Service Worker] ${type}: ${url}`);
  if (status) {
    console.log(`[Service Worker] Status: ${status}`);
  }
};

// Helper function to get user-friendly error message for non-GET requests
const getNonGetErrorMessage = (url) => {
  return 'This action requires an internet connection. Please connect to continue.';
};

// Cache and return requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // console.log('[Service Worker] Fetch event:', url.pathname, 'Method:', event.request.method);

  // Handle API GET requests
  if (isApiRequest(url) && isGetRequest(event.request)) {
    event.respondWith(
      (async () => {
        try {
          // logCacheOperation('API Request', url.pathname);

          // Try cache first
          const cachedResponse = await caches.match(event.request.url);
          if (cachedResponse) {
            // logCacheOperation('Cache Hit', url.pathname);
            return new Response(cachedResponse.body, {
              headers: {
                ...Array.from(cachedResponse.headers.entries()),
                'X-Cache-Hit': 'true',
                'X-Cache-Date': cachedResponse.headers.get('date') || new Date().toISOString()
              }
            });
          }

          // logCacheOperation('Cache Miss', url.pathname);
          // If not in cache, try network
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(event.request.url, networkResponse.clone());
            updateLastOnlineTimestamp();
            // logCacheOperation('Cached Response', url.pathname, networkResponse.status);
          }
          return networkResponse;
        } catch (error) {
          // logCacheOperation('Error', url.pathname, error.message);
          return new Response(
            JSON.stringify({
              error: 'Failed to fetch resource',
              type: 'network_error',
              timestamp: new Date().toISOString()
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      })()
    );
  }

  // Handle API non-GET requests
  if (isApiRequest(url) && !isGetRequest(event.request)) {
    // console.log('[Service Worker] Non-GET API Request:', url.pathname);
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // If network fails, return specific offline message
          const errorMessage = getNonGetErrorMessage(url);
          // logCacheOperation('Error', url.pathname, errorMessage);
          return new Response(
            JSON.stringify({
              message: errorMessage,
              type: 'offline_error',
              timestamp: new Date().toISOString()
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      })()
    );
  }

  // Handle same-origin requests (frontend assets)
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        try {
          // logCacheOperation('Frontend Request', url.pathname);

          if (isGetRequest(event.request)) {
            // Try cache first for static assets
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
              // logCacheOperation('Cache Hit', url.pathname);
              return cachedResponse;
            }

            // logCacheOperation('Cache Miss', url.pathname);
            // If not in cache, try network
            const networkResponse = await fetch(event.request);
            if (networkResponse && networkResponse.status === 200) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(event.request, networkResponse.clone());
              // logCacheOperation('Cached Response', url.pathname, networkResponse.status);
            }
            return networkResponse;
          } else {
            // For non-GET requests to frontend, just try network
            return fetch(event.request);
          }
        } catch (error) {
          // logCacheOperation('Error', url.pathname, error.message);
          return new Response(
            JSON.stringify({
              error: 'Failed to fetch resource',
              type: 'network_error',
              timestamp: new Date().toISOString()
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      })()
    );
  }
});

// Install a service worker
self.addEventListener('install', event => {
  // console.log('[Service Worker] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // console.log('[Service Worker] Opening cache...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // console.log('[Service Worker] Cache populated successfully');
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  // console.log('[Service Worker] Activating service worker...');
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
      .then(() => {
        // console.log('[Service Worker] Activation complete');
      })
  );
});

// Listen for the skip waiting message
self.addEventListener('message', (event) => {
  // console.log('[Service Worker] Received message:', event.data.type);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // console.log('[Service Worker] Skipping waiting...');
    self.skipWaiting();
  }
});
