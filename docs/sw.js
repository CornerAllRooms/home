// Service Worker for CornerRoom PWA - Complete Subdirectory Solution
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

// Install event - cache all essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
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

// Fetch event handler
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

  // Special handling for manifest.json
  if (pathname.endsWith('manifest.json')) {
    event.respondWith(
      handleManifestRequest(event.request)
    );
    return;
  }

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
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) return cachedResponse;
        
        // Otherwise fetch from network
        return fetch(event.request).then(response => {
          // Cache new responses (except HTML)
          if (response.ok && !response.headers.get('content-type').includes('text/html')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
          }
          return response;
        });
      })
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/index.html')
  );
});

// Handle manifest requests with team-specific icons
async function handleManifestRequest(request) {
  try {
    // First try to get from cache
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Otherwise fetch fresh and modify
    const response = await fetch(request);
    const manifest = await response.json();
    
    // Get user's selected team from all clients
    const team = await getTeamPreference();
    
    // Update manifest with team-specific icon
    manifest.icons = manifest.icons.map(icon => {
      // Use team-specific icon if available, otherwise fallback to original
      const iconForTeam = icon.team === team ? icon.src : '/original.png';
      return {
        ...icon,
        src: iconForTeam
      };
    });
    
    // Update theme color if needed
    if (team === 'black') manifest.theme_color = '#FF0000';
    else if (team === 'gold') manifest.theme_color = '#FFC0CB';
    else if (team === 'green-gold') manifest.theme_color = '#008000';
    else manifest.theme_color = '#FFA500'; // original
    
    return new Response(JSON.stringify(manifest), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error handling manifest:', error);
    return fetch(request);
  }
}

// Get team preference from clients
async function getTeamPreference() {
  // Try to get from all clients
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    try {
      // Post message to client to get preference
      const messageChannel = new MessageChannel();
      const promise = new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.team || 'original');
        };
      });
      
      client.postMessage({
        type: 'GET_TEAM_PREFERENCE'
      }, [messageChannel.port2]);
      
      const team = await promise;
      if (team) return team;
    } catch (e) {
      console.error('Error getting team preference from client:', e);
    }
  }
  
  // Fallback to default
  return 'original';
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data.type === 'TEAM_UPDATE') {
    // When team changes, we might want to update the cache
    caches.open(CACHE_NAME).then(cache => {
      // Re-cache the manifest with new team settings
      return fetch('/manifest.json')
        .then(response => handleManifestRequest(response))
        .then(updatedManifest => {
          return cache.put('/manifest.json', updatedManifest);
        });
    });
  }
});