const CACHE_NAME = 'mr-portfolio-v8';
const ASSETS = [
  '/',
  '/index.html',
  '/ar/index.html',
  '/about.html',
  '/contact.html',
  '/faqs.html',
  '/assets/css/style.css',
  '/assets/css/rtl.css',
  '/assets/css/blog.css',
  '/assets/css/academy.css',
  '/assets/css/prompts.css',
  '/assets/js/main.js',
  '/manifest.json',
  '/404.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          ASSETS.map(url => cache.add(url).catch(() => {}))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-first for HTML, CSS, and JS (ensures fresh content always)
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then((cached) => {
              if (cached) return cached;
              if (event.request.mode === 'navigate') {
                return caches.match('/404.html').then((fallback) => fallback || new Response('<h1>Offline</h1><p>Please check your connection.</p>', { headers: { 'Content-Type': 'text/html' } }));
              }
              return new Response('', { status: 408, statusText: 'Offline' });
            });
        })
    );
    return;
  }

  // Cache-first for images, fonts, and other static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;

        return fetch(event.request).then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }

          if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|woff2?|ttf|eot|ico)$/)) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return fetchResponse;
        }).catch(() => {
          return new Response('', { status: 408, statusText: 'Offline' });
        });
      })
  );
});
