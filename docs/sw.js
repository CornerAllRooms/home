// Service Worker for CornerRoom PWA
const CACHE_NAME = 'cornerroom-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/quotes.js',
  '/quotes.css',
  '/manifest.json',
  '/black.png',
  '/gold.png',
  '/green-gold.png',
  '/original.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all essential assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Handle navigation requests specially
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then((cachedResponse) => {
          return cachedResponse || fetch(event.request);
        })
    );
    return;
  }

  // For all other requests
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
        return fetch(event.request)
          .then((response) => {
            // Cache the new response if successful
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch((error) => {
            console.log('[Service Worker] Fetch failed:', error);
            // Optional: Return a fallback response here
          });
      })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || 'https://cornerroom.co.za')
  );
});

// Push event handler (if you want push notifications)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  const data = event.data?.json();
  const title = data?.title || 'CornerRoom';
  const options = {
    body: data?.body || 'New notification',
    icon: data?.icon || '/black.png',
    data: { url: data?.url || 'https://cornerroom.co.za' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});