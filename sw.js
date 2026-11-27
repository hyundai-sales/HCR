/* TEAM RER PWA service worker with Firebase background push support.
   Release marker: 2026-11-27-team-rer-push-bg-01 */

// Firebase compat SDK is used here because service workers cannot use ES module imports
// in this classic worker file.
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyACEuFMX0Ly0p4RpkqJCThL6TTfIrsrEiA",
  authDomain: "team-rer-hyundai.firebaseapp.com",
  projectId: "team-rer-hyundai",
  storageBucket: "team-rer-hyundai.firebasestorage.app",
  messagingSenderId: "419126543512",
  appId: "1:419126543512:web:3b5e11657efa4cc7417ced",
  measurementId: "G-EB98RG1VYH"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const notification = payload.notification || {};
  const title = notification.title || 'TEAM RER';
  const options = {
    body: notification.body || 'You have a new notification.',
    icon: './icons/team-rer-192.png',
    badge: './icons/team-rer-192.png',
    data: payload.data || {}
  };
  return self.registration.showNotification(title, options);
});

/* TEAM RER service worker cache/activation behavior */
const APP_RELEASE = '2026-11-27-team-rer-push-bg-01';
const CACHE_NAME = 'team-rer-static-v9';
const APP_SCOPE = new URL('./', self.location).pathname;
const STATIC_FILES = [
  './manifest.webmanifest',
  './icons/team-rer-192.png',
  './icons/team-rer-512.png',
  './icons/team-rer-512-maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES)));
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TEAM_RER_SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('team-rer-static-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_SCOPE)) return;
  event.respondWith(fetch(request));
});
