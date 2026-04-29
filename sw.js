// PO Catat - Service Worker (basic offline cache)
const CACHE = 'po-catat-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg'
  ];

self.addEventListener('install', (e) => {
    e.waitUntil(
          caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
        );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
          caches.keys().then((keys) =>
                  Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
                                 ).then(() => self.clients.claim())
        );
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    // Only cache GET requests for same-origin static assets
                        if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

                        e.respondWith(
                              caches.match(req).then((cached) => {
                                      const fetchPromise = fetch(req).then((res) => {
                                                if (res && res.status === 200 && res.type === 'basic') {
                                                            const copy = res.clone();
                                                            caches.open(CACHE).then((c) => c.put(req, copy));
                                                }
                                                return res;
                                      }).catch(() => cached);
                                      return cached || fetchPromise;
                              })
                            );
});
