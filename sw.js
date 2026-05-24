// Cockpit Service Worker — handles notifications when app is in background
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "schedule-notification") {
    const { title, options, delayMs } = event.data;
    const wait = typeof delayMs === "number" ? delayMs : 0;
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(() => {
          self.registration.showNotification(title, options).then(resolve).catch(resolve);
        }, wait);
      })
    );
  }
  if (event.data && event.data.type === "clear-notification") {
    self.registration.getNotifications({ tag: event.data.tag }).then((notifs) => {
      notifs.forEach((n) => n.close());
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/cockpit/");
      }
    })
  );
});
