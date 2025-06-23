// Listen for push events (for future PWA support)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'CornerRoom', {
      body: data.body,
      icon: data.icon,
      data: { url: data.url || 'https://cornerroom.co.za' }
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});