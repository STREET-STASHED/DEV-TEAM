// Enhanced Service Worker for StreetStashed PWA
const CACHE_NAME = 'streetstashed-v2'
const STATIC_CACHE = 'streetstashed-static-v2'
const DYNAMIC_CACHE = 'streetstashed-dynamic-v2'
const API_CACHE = 'streetstashed-api-v2'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/apple-touch-icon.png'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/health',
  '/api/products',
  '/api/categories'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Static files cached successfully')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('Error caching static files:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle different types of requests
  if (isStaticFile(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request, API_CACHE))
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE))
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
  }
})

// Cache First Strategy - for static files
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Cache first strategy failed:', error)
    return getOfflineResponse(request)
  }
}

// Network First Strategy - for dynamic content
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Network first strategy failed:', error)

    // Try to get from cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response
    return getOfflineResponse(request)
  }
}

// Check if request is for static files
function isStaticFile(request) {
  const url = new URL(request.url)
  return STATIC_FILES.includes(url.pathname) ||
         url.pathname.startsWith('/_next/static/') ||
         url.pathname.startsWith('/icons/') ||
         url.pathname.startsWith('/images/')
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/')
}

// Check if request is for images
function isImageRequest(request) {
  const url = new URL(request.url)
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
         url.pathname.includes('/storage/')
}

// Get offline response
async function getOfflineResponse(request) {
  const url = new URL(request.url)

  // Try to serve offline page for navigation requests
  if (request.mode === 'navigate') {
    const offlineResponse = await caches.match('/offline')
    if (offlineResponse) {
      return offlineResponse
    }
  }

  // Return a simple offline response
  return new Response(
    JSON.stringify({
      error: 'You are offline',
      message: 'Please check your internet connection and try again',
      timestamp: new Date().toISOString()
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }
  )
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Handle background sync
async function doBackgroundSync() {
  try {
    // Get pending offline actions from IndexedDB
    const pendingActions = await getPendingOfflineActions()

    for (const action of pendingActions) {
      try {
        await processOfflineAction(action)
        await removePendingAction(action.id)
      } catch (error) {
        console.error('Failed to process offline action:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Get pending offline actions (placeholder)
async function getPendingOfflineActions() {
  // This would integrate with IndexedDB to get pending actions
  return []
}

// Process offline action (placeholder)
async function processOfflineAction(action) {
  // This would process different types of offline actions
  console.log('Processing offline action:', action)
}

// Remove pending action (placeholder)
async function removePendingAction(actionId) {
  // This would remove the action from IndexedDB
  console.log('Removing pending action:', actionId)
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'StreetStashed', options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  }
})

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          return cache.addAll(event.data.urls)
        })
    )
  }
})

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-update') {
      event.waitUntil(updateContent())
    }
  })
}

// Update content periodically
async function updateContent() {
  try {
    // Update cached content
    const cache = await caches.open(DYNAMIC_CACHE)
    const requests = await cache.keys()

    for (const request of requests) {
      try {
        const response = await fetch(request)
        if (response.ok) {
          await cache.put(request, response)
        }
      } catch (error) {
        console.error('Failed to update cached content:', error)
      }
    }
  } catch (error) {
    console.error('Periodic content update failed:', error)
  }
}
