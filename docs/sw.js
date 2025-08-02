// Service Worker for CornerRoom PWA - Version 2.0
const CACHE_NAME = 'cornerroom-cache-v10';
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
  '/load.gif',
  '/fitness.mp4'
];

// Paths to bypass caching
const BYPASS_PATHS = [
  '/aitrainer/',
  '/tcs/',
  '/aichat/',
  '/aiabout/',
  '/privacy/',
  '/saferoom/',
  '/cookies/'
];

// Install event - Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('All assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Bypass caching for specific paths
  if (BYPASS_PATHS.some(path => url.pathname.startsWith(path))) {
    return fetch(request);
  }

  // Bypass caching for non-GET requests
  if (request.method !== 'GET') return;

  // Special handling for manifest
  if (url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      handleManifestRequest(request)
    );
    return;
  }

  // Cache-first strategy for theme assets
  if (isThemeAsset(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request))
    );
    return;
  }

  // Network-first strategy for other requests
  event.respondWith(
    fetch(request)
      .then(networkResponse => {
        // Cache successful responses (except HTML)
        if (networkResponse.ok && 
            !networkResponse.headers.get('content-type')?.includes('text/html')) {
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

// Customize manifest based on current theme
async function customizeManifest(manifest) {
  // Get current team from clients
  const team = await getCurrentTeam();
  
  // Update theme color
  manifest.theme_color = getThemeColor(team);
  
  // Update icons if needed
  if (team !== 'original') {
    manifest.icons = manifest.icons.map(icon => {
      if (icon.purpose === 'any') {
        return {
          ...icon,
          src: `/${team}.png`
        };
      }
      return icon;
    });
  }

  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Get current team preference from clients
async function getCurrentTeam() {
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    try {
      // Request team info from client
      const response = await client.postMessage({
        type: 'GET_CURRENT_TEAM'
      });
      if (response?.team) return response.team;
    } catch (e) {
      console.log('Could not get team from client:', e);
    }
  }
  return 'original'; // Default team
}

// Get theme color for team
function getThemeColor(team) {
  const colors = {
    'black': '#FF0000',
    'gold': '#FFC0CB',
    'green-gold': '#008000',
    'original': '#FFA500'
  };
  return colors[team] || colors.original;
}

// Check if path is a theme asset
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
  switch (event.data.type) {
    case 'THEME_UPDATE':
      handleThemeUpdate(event.data);
      break;
      
    case 'INIT_NOTIFICATIONS':
      initNotifications(event.data.team);
      break;
      
    case 'GET_CURRENT_TEAM':
      // Response handled via client.postMessage in getCurrentTeam()
      break;
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
  
  // Notify all clients about theme update
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'THEME_UPDATED',
      team: data.team
    });
  });
}

// Initialize notifications
function initNotifications(team) {
  console.log('Initializing notifications for team:', team);
  // You would add your notification scheduling logic here
}

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Background sync registration (optional)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('Background sync triggered');
    // Add your background sync logic here
  }
});