const CACHE_NAME = 'cornerroom-cache-v1';
const ASSETS_TO_CACHE = [
  '/',  
  '/index.html',
  '/quotes.js',
  '/black.png',
  '/gold.png',
  '/green-gold.png',
  '/original.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// (Keep your existing notification click handler)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || 'https://cornerroom.co.za')
  );
});