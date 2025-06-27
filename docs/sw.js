// Service Worker for CornerRoom PWA - Complete Subdirectory Solution
const CACHE_NAME = 'cornerroom-cache-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/styles.css',
  '/quotes.js',
  '/quotes.css',
  '/manifest.json',
  '/black.png',
  '/gold.png',
  '/green-gold.png',
  '/original.png',
  '/load.gif',
  '/load.css',
  '/menu.css',
  '/accept.css',
  '/screen.js',
  '/auth.js',
  '/accept.js'
];

// List of all subdirectories to bypass
const SUBDIRECTORIES = [
  '/aitrainer/',
  '/tcs/',
  '/aichat/',
  '/aiabout/',
  '/privacy/',
  '/saferoom/',
  '/cookies/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  const pathname = requestUrl.pathname;

  // Bypass SW completely for all subdirectories
  if (SUBDIRECTORIES.some(subdir => pathname.startsWith(subdir))) {
    return fetch(event.request);
  }

  // Bypass for non-GET requests and non-whitelisted extensions
  if (event.request.method !== 'GET') return;
  if (/\.(json|xml|php|cgi|py)$/i.test(pathname)) return;

  // Special handling for root HTML
  if (event.request.mode === 'navigate' && pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Only cache successful root index.html
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for all other assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => cachedResponse || 
        fetch(event.request).then(response => {
          // Cache new responses (except HTML)
          if (response.ok && !response.headers.get('content-type').includes('text/html')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
          }
          return response;
        })
      )
  );
});

// Keep your existing notification handlers
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});