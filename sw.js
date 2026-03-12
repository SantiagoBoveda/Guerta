// Güerta — Service Worker v1
// Coloca este archivo en la raíz del repo (mismo nivel que index.html)

const CACHE_NAME = 'guerta-v1';

self.addEventListener('install', e => {
  // Cachear solo la página principal al instalar
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.add('./'))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()) // no bloquear si falla el cache
  );
});

self.addEventListener('activate', e => {
  // Limpiar caches viejos
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Network-first: intentar red, caer a cache si falla
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Actualizar cache con respuesta fresca
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
