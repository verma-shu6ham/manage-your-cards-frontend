// This is the service worker for CreditSetu PWA

const CACHE_NAME = 'creditsetu-v1';
const DYNAMIC_CACHE = 'creditsetu-dynamic-v1';

// Static assets to cache
const urlsToCache = [
  '/dashboard',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints that should never be cached
const API_ENDPOINTS = [
  '/api/cards',
  '/api/transactions',
  '/api/user'
];

// Check if a request is for an API endpoint
const isApiRequest = (url) => {
  return API_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests with network-first strategy for API calls
self.addEventListener('fetch', event => {
  // For API requests, use network-first strategy
  if (isApiRequest(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Only cache successful responses
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone the response before using it
          const responseToCache = response.clone();
          
          // Store the latest API response in dynamic cache
          caches.open(DYNAMIC_CACHE).then(cache => {
            // Delete old cached version before storing new one
            cache.delete(event.request).then(() => {
              cache.put(event.request, responseToCache);
            });
          });
          
          return response;
        })
        .catch(() => {
          // If offline, try to return cached response
          return caches.match(event.request);
        })
    );
    return;
  }

  // For non-API requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Update a service worker and clean old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old cache versions
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for the skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
