const CACHE_NAME = 'axon-os-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/src/main.jsx',
  '/src/index.css',
  '/src/App.jsx'
];

// Instalação do Service Worker e cacheamento de assets básicos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições: Estratégia Stale-While-Revalidate
self.addEventListener('fetch', (e) => {
  // Ignorar requisições de API (Supabase) para evitar cachear dados em tempo real incorretamente
  if (e.request.url.includes('supabase.co') || e.request.url.includes('/rest/v1/')) {
    return;
  }

  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        const fetchedResponse = fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Se falhar rede e não tiver cache, retorna offline
          return cachedResponse;
        });

        return cachedResponse || fetchedResponse;
      });
    })
  );
});
