// Service Worker for CornerRoom PWA - Complete Subdirectory Solution
// Add this to your activate event in sw.js
caches.keys().then(cacheNames => {
  return Promise.all(
    cacheNames.map(cache => caches.delete(cache))
  );
})
const CACHE_NAME = 'cornerroom-cache-v7';
const ICONS_TO_CACHE = [
  '/black.png',
  '/gold.png',
  '/green-gold.png',
  '/original.png'
];
const ASSETS_TO_CACHE = [
  '/index.html',
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
const THEME_ASSETS = [
  '/black.png',
  '/gold.png',
  '/green-gold.png',
  '/original.png',
  '/manifest.json'
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
  if (event.request.mode === 'navigate' && pathname === '/index.html') {
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
    clients.openWindow(event.notification.data?.url || '/index.html')
  );
});
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([...THEME_ASSETS, '/']))
      .then(() => self.skipWaiting())
  );
});
 if (THEME_ASSETS.some(asset => e.request.url.includes(asset))) {
    e.respondWith(
      caches.match(e.request)
        .then(cached => cached || fetch(e.request))
    );
    return;
  }
  self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Intercept manifest requests
  if (url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      (async () => {
        // Get user's team preference
        const team = await getTeamPreference(); // Implement this (e.g., from IndexedDB)
        
        // Clone and modify manifest
        const baseManifest = await fetch(event.request);
        const manifest = await baseManifest.json();
        
        // Update for current team
        manifest.icons = manifest.icons.map(icon => ({
          ...icon,
          src: icon.team === team ? icon.src : `/default-${icon.sizes}.png`
        }));
        
        return new Response(JSON.stringify(manifest));
      })()
    );
  }
});