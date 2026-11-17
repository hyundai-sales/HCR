/* TEAM RER PWA service worker.
   Release marker: 2026-11-18-team-rer-release-04
   Change this marker whenever the app experience OR its connected services
   are updated, then publish this file with that release.
   This worker does not cache HTML, authenticated data, or application details. */
const APP_RELEASE = '2026-11-18-team-rer-release-04';
const CACHE_NAME = 'team-rer-static-v4';
const APP_SCOPE = new URL('./', self.location).pathname;
const STATIC_FILES = [
  './manifest.webmanifest',
  './icons/team-rer-192.png',
  './icons/team-rer-512.png',
  './icons/team-rer-512-maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_FILES))
  );
});

// The new version waits until the user chooses Update Now.
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TEAM_RER_SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key =>
        key.startsWith('team-rer-static-') && key !== CACHE_NAME
      ).map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// Network-first for page navigation; never serve a stale authenticated app shell.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_SCOPE)) return;
  event.respondWith(fetch(request));
});
