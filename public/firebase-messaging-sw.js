// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4Mx-v5Gv-j-R8q3tv9YZ9F3K9IDilsDI",
  authDomain: "streetstashed-e1b8d.firebaseapp.com",
  projectId: "streetstashed-e1b7d",
  storageBucket: "streetstashed-e1b7d.firebasestorage.app",
  messagingSenderId: "718676028302",
  appId: "1:718676028302:web:1592f15d4f3538b5ecd2df"
};

// VAPID Key for web push notifications
const vapidKey = "BI_fDQvkzkgJVoV8BtNA6tfj7-FCRZ76E4eAfLnHwcMVOxApYSz9Nl8-gwLmJMpx05gyGmPnTbfe2QZ26s-HvtI";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[Firebase] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'StreetStashed';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: payload.notification?.badge || '/icons/icon-192x192.png',
    image: payload.notification?.image,
    data: payload.data || {},
    actions: payload.notification?.actions || [],
    requireInteraction: payload.notification?.require_interaction || false,
    tag: payload.notification?.tag || 'default',
    renotify: payload.notification?.renotify || false,
    vibrate: [200, 100, 200],
    silent: false
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Firebase] Notification clicked:', event);

  event.notification.close();

  if (event.action) {
    // Handle custom actions
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Default click behavior
    handleDefaultNotificationClick(event.notification.data);
  }
});

// Handle notification actions
function handleNotificationAction(action, data) {
  switch (action) {
    case 'view_order':
      if (data.order_id) {
        openPage(`/orders/${data.order_id}`);
      }
      break;
    case 'chat':
      if (data.order_id) {
        openPage(`/chat/${data.order_id}`);
      }
      break;
    case 'dismiss':
      // Just close the notification
      break;
    default:
      console.log('[Firebase] Unknown notification action:', action);
  }
}

// Handle default notification click
function handleDefaultNotificationClick(data) {
  if (data.order_id) {
    openPage(`/orders/${data.order_id}`);
  } else if (data.type === 'payment_success') {
    openPage('/orders');
  } else if (data.type === 'delivery_update') {
    openPage('/orders');
  } else if (data.url) {
    openPage(data.url);
  } else {
    openPage('/');
  }
}

// Open page in existing or new window
function openPage(url) {
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }

        // If no existing window/tab, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
}

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('[Firebase] Service Worker installing...');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('[Firebase] Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[Firebase] Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[Firebase] Firebase messaging service worker loaded');
