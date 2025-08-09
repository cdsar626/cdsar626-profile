// Service Worker for performance optimization
const CACHE_NAME = 'portfolio-v1';
const STATIC_CACHE_NAME = 'portfolio-static-v1';
const DYNAMIC_CACHE_NAME = 'portfolio-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/favicon.svg',
  '/fonts/inter-var.woff2',
  '/assets/images/profile/profile-placeholder.svg'
];

// Assets to cache on demand
const CACHE_STRATEGIES = {
  // Cache first for static assets
  static: [
    /\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/,
    /\/assets\//,
    /\/fonts\//
  ],
  
  // Network first for HTML pages
  pages: [
    /\/$/,
    /\.html$/
  ],
  
  // Stale while revalidate for API calls
  api: [
    /\/api\//
  ]
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (unless they're assets)
  if (url.origin !== location.origin && !isAsset(url.pathname)) {
    return;
  }
  
  // Determine caching strategy
  const strategy = getCachingStrategy(url.pathname);
  
  switch (strategy) {
    case 'static':
      event.respondWith(cacheFirst(request));
      break;
    case 'pages':
      event.respondWith(networkFirst(request));
      break;
    case 'api':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Cache first strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    
    // Try to return cached version as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or error response
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy - for HTML pages
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network first strategy failed:', error);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return new Response('Offline', { status: 503 });
  }
}

// Stale while revalidate strategy - for API calls
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('Background fetch failed:', error);
    });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network response
  return networkResponsePromise;
}

// Helper functions
function getCachingStrategy(pathname) {
  // Check static assets
  for (const pattern of CACHE_STRATEGIES.static) {
    if (pattern.test(pathname)) {
      return 'static';
    }
  }
  
  // Check pages
  for (const pattern of CACHE_STRATEGIES.pages) {
    if (pattern.test(pathname)) {
      return 'pages';
    }
  }
  
  // Check API calls
  for (const pattern of CACHE_STRATEGIES.api) {
    if (pattern.test(pathname)) {
      return 'api';
    }
  }
  
  return 'default';
}

function isAsset(pathname) {
  return /\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/.test(pathname) ||
         pathname.startsWith('/assets/') ||
         pathname.startsWith('/fonts/');
}

// Background sync for offline actions (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
      event.waitUntil(doBackgroundSync());
    }
  });
}

async function doBackgroundSync() {
  // Handle any offline actions that need to be synced
  console.log('Background sync triggered');
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    // Log performance metrics
    console.log('Performance metrics:', event.data.metrics);
  }
});