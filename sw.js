const CACHE_VERSION = 'v2';
const CACHE_NAME = 'chordcharts-' + CACHE_VERSION;

const CORE_ASSETS = [
  './',
  './index.html',
  './data.js',
  './manifest.json',
  './css/common.css',
  './css/theme.css',
  './css/print.css',
  './js/common.js',
  './js/proc.js',
  './js/render.js',
  './js/action.js',
  './js/app.js',
  './js/pwa.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(CORE_ASSETS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(keys.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }));
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('message', function(event) {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function(event) {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(function() {
        return caches.match('./index.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function(cached) {
      const network = fetch(request)
        .then(function(response) {
          if (response && response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(function() {
          return cached;
        });

      return cached || network;
    })
  );
});
