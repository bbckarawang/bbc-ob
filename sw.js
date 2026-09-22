const CACHE_NAME = 'bbc-gs-v3'; // Naikkan versi cache setiap kali ada perubahan UI
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-ob.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Memaksa SW baru segera aktif
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Hapus cache versi lama
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategi Network First: Utamakan ambil dari internet dulu agar selalu dapat versi terbaru
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jika internet lancar, simpan hasilnya ke cache dan tampilkan
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika offline / tidak ada internet, baru ambil dari cache
        return caches.match(event.request);
      })
  );
});
