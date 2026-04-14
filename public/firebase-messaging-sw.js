// v3 — bump this comment to force browsers to pick up SW changes
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAjNVjDD3dmHrIK9PQItvQrYUpEZ3Rk7yg",
  authDomain: "webbased-projects.firebaseapp.com",
  projectId: "webbased-projects",
  storageBucket: "webbased-projects.firebasestorage.app",
  messagingSenderId: "922007308614",
  appId: "1:922007308614:web:f3eae13125a10f9221fd47",
});

const messaging = firebase.messaging();

// Handle background/killed-tab messages
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const title = payload.notification?.title || "ONETT Notification";
  const body = payload.notification?.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/onet-logo.jpeg",
    badge: "/onet-logo.jpeg",
    data: { url: payload.data?.url || "/notifications" },
    vibrate: [200, 100, 200],
  });
});

// Open or focus the app when a notification is tapped
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) || "/notifications";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If there's already a window open, navigate it to the target
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Force the new SW to activate immediately without waiting
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});