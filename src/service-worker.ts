/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { getMessaging } from 'firebase/messaging/sw';
import { initializeApp } from 'firebase/app';

declare const self: ServiceWorkerGlobalScope;

// Config Firebase
const firebaseApp = initializeApp({
  apiKey: "AIzaSyD38C-wyEziutHYrQG4rFatW-9Z5In37Ss",
  authDomain: "criptax-8d87d.firebaseapp.com",
  projectId: "criptax-8d87d",
  storageBucket: "criptax-8d87d.appspot.com",
  messagingSenderId: "693837443791",
  appId: "1:693837443791:web:c3d93b462cc82458e6bdba",
  measurementId: "G-YNX6MZDC7K"
});

const messaging = getMessaging(firebaseApp);

clientsClaim();

// Precache dei file statici
precacheAndRoute(self.__WB_MANIFEST);

// Gestione notifiche push con branding CriptX
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.notification.body,
      icon: data.notification.icon || '/criptx-icon-192.png', // Icona CriptX
      badge: '/criptx-badge.png', // Badge notifica CriptX
      tag: data.data?.chatId || 'default',
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Apri Chat'
        },
        {
          action: 'close',
          title: 'Chiudi'
        }
      ],
      vibrate: [200, 100, 200],
      renotify: true,
      silent: data.notification.silent || false,
      timestamp: Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(
        `CriptX - ${data.notification.title}`, 
        options
      )
    );
  } catch (error) {
    console.error('Errore notifica:', error);
  }
});

// Strategie di caching ottimizzate per CriptX
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'criptx-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 giorni
      }),
    ],
  })
);

// Cache per le chat recenti
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/chats/'),
  new NetworkFirst({
    cacheName: 'criptx-chats',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 giorno
      }),
    ],
  })
);

// Cache per i profili utente
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/users/'),
  new StaleWhileRevalidate({
    cacheName: 'criptx-users',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 3 * 24 * 60 * 60, // 3 giorni
      }),
    ],
  })
);

// Gestione navigazione
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'criptx-pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60 // 1 giorno
      }),
    ],
    networkTimeoutSeconds: 3,
    matchOptions: {
      ignoreSearch: true
    }
  })
);

// Fallback per offline
const offlineFallbackPage = '/offline.html';

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(offlineFallbackPage);
      })
    );
  }
});

// Pulizia cache vecchia
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('criptx-') && !cacheName.includes(version)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Versione per controllo cache
const version = 'v1.0.0';

// Gestione errori migliorata
self.addEventListener('error', (event) => {
  console.error('CriptX SW Error:', event.error);
  // Qui puoi aggiungere la logica per inviare gli errori a un servizio di monitoring
});

// Strategia di caching per le risorse statiche
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'criptx-static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 giorni
      })
    ]
  })
);

// Cache per le API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'criptx-api-responses',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 minuti
      })
    ],
    networkTimeoutSeconds: 3
  })
);

// Cache immagini
registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images'
  })
);

// Cache API calls
registerRoute(
  ({url}) => url.pathname.startsWith('/api'),
  new NetworkFirst({
    cacheName: 'api-cache'
  })
); 