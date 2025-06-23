// Service Worker Installation
self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || 'https://cornerroom.co.za')
  );
});