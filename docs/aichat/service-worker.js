const CACHE_NAME = 'chatting-corner-v3';
const ASSETS_TO_CACHE = [
  '/aichat/',
  '/aichat/index.html',
  '/aichat/style.css',
  '/aichat/script.js',
  '/aichat/home.js',
  '/aichat/car.png',
   '/aichat/trash.png',
  '/aichat/logo.png',
  '/aichat/gemini.svg',
  '/aichat/manifest.json',
  '/aichat/server.js',
];
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('http:')) {
    event.respondWith(
      fetch(event.request.url.replace('http:', 'https:'))
    );
  }
});

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
  // Cache API responses
  if (event.request.url.includes('generateContent')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // For all other requests, try cache first, then network
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request);
        })
    );
  }
});