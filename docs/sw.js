// Service Worker for CornerRoom PWA
const CACHE_NAME = 'cornerroom-cache-v9';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/theme-manager.js',
  '/quotes.js',
  '/manifest.json',
  '/black.png',
  '/gold.png',
  '/green-gold.png',
  '/original.png',
  '/load.gif'
];

// Subdirectories to bypass
const BYPASS_PATHS = [
  '/aitrainer/',
  '/tcs/',
  '/aichat/',
  '/aiabout/',
  '/privacy/',
  '/saferoom/',
  '/cookies/'
];

// Install - Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch - Network first with cache fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Bypass for specific paths
  if (BYPASS_PATHS.some(path => url.pathname.startsWith(path))) {
    return fetch(request);
  }

  // Bypass for non-GET requests
  if (request.method !== 'GET') return;

  // Special handling for manifest
  if (url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      handleManifestRequest(request)
    );
    return;
  }

  // For theme assets, check cache first
  if (isThemeAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(
    fetch(request)
      .then(networkResponse => {
        // Cache successful responses (except HTML)
        if (networkResponse.ok && !networkResponse.headers.get('content-type')?.includes('text/html')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

// Handle manifest requests with theme support
async function handleManifestRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const manifest = await networkResponse.json();
      return customizeManifest(manifest);
    }
  } catch (e) {
    console.log('Network manifest fetch failed, trying cache');
  }

  // Fallback to cache
  const cached = await caches.match(request);
  if (cached) {
    const manifest = await cached.json();
    return customizeManifest(manifest);
  }

  // Final fallback
  return fetch(request);
}

// Customize manifest based on theme
async function customizeManifest(manifest) {
  // Get team preference from clients
  const team = await getTeamPreference();
  
  // Update theme color
  manifest.theme_color = getThemeColor(team);
  
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Get team preference from clients
async function getTeamPreference() {
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    try {
      const response = await client.postMessage({
        type: 'GET_TEAM_REQUEST'
      });
      if (response?.team) return response.team;
    } catch (e) {
      console.log('Could not get team from client:', e);
    }
  }
  return 'original'; // Default
}

function getThemeColor(team) {
  const colors = {
    'black': '#FF0000',
    'gold': '#FFC0CB',
    'green-gold': '#008000',
    'original': '#FFA500'
  };
  return colors[team] || colors.original;
}

function isThemeAsset(path) {
  return [
    '/black.png',
    '/gold.png',
    '/green-gold.png',
    '/original.png',
    '/manifest.json'
  ].some(asset => path.includes(asset));
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data.type === 'THEME_UPDATE') {
    handleThemeUpdate(event.data);
  }
});

// Update cache when theme changes
async function handleThemeUpdate(data) {
  const cache = await caches.open(CACHE_NAME);
  
  // Update manifest in cache
  const manifestResponse = await cache.match('/manifest.json');
  if (manifestResponse) {
    const manifest = await manifestResponse.json();
    manifest.theme_color = data.themeColor;
    await cache.put('/manifest.json', new Response(JSON.stringify(manifest)));
  }
  
  // Notify all clients
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'THEME_UPDATED',
      team: data.team
    });
  });
}

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});