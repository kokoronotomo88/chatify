/** @file service-worker.js
 *  Chattify Service Worker — Cache + Offline + Sync + Push
 */

import { CacheStrategy }   from './sw/CacheStrategy.js';
import { OfflineStrategy } from './sw/OfflineStrategy.js';
import { SyncStrategy }    from './sw/SyncStrategy.js';
import { PushStrategy }    from './sw/PushStrategy.js';
import { VersionStrategy } from './sw/VersionStrategy.js';

const SW_VERSION  = 'v1.0.0';
const CACHE_NAME  = `chattify-${SW_VERSION}`;
const STATIC_CACHE = `chattify-static-${SW_VERSION}`;
const DYNAMIC_CACHE = `chattify-dynamic-${SW_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/main.js',
  '/manifest.json',
  '/assets/css/main.css',
  '/assets/css/variables.css',
  '/assets/css/animations.css',
  '/assets/icons/favicon.svg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
];

/** ── Install ── */
self.addEventListener('install', (e) => {
  console.info(`[SW ${SW_VERSION}] Installing...`);
  e.waitUntil(
    VersionStrategy.cleanOldCaches(SW_VERSION).then(() =>
      CacheStrategy.precache(STATIC_CACHE, STATIC_ASSETS)
    ).then(() => self.skipWaiting())
  );
});

/** ── Activate ── */
self.addEventListener('activate', (e) => {
  console.info(`[SW ${SW_VERSION}] Activating...`);
  e.waitUntil(
    VersionStrategy.cleanOldCaches(SW_VERSION)
      .then(() => self.clients.claim())
  );
});

/** ── Fetch ── */
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // HTML navigation — Network First with offline fallback
  if (request.mode === 'navigate') {
    e.respondWith(OfflineStrategy.networkFirstWithFallback(request, '/offline.html'));
    return;
  }

  // Static assets — Cache First
  if (STATIC_ASSETS.some(a => url.pathname === a)) {
    e.respondWith(CacheStrategy.cacheFirst(request, STATIC_CACHE));
    return;
  }

  // API calls — Network First, no cache
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(CacheStrategy.networkOnly(request));
    return;
  }

  // Fonts & images — Stale While Revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(CacheStrategy.staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Everything else — Stale While Revalidate
  e.respondWith(CacheStrategy.staleWhileRevalidate(request, DYNAMIC_CACHE));
});

/** ── Background Sync ── */
self.addEventListener('sync', (e) => {
  console.info('[SW] Sync event:', e.tag);
  if (e.tag === 'sync-messages') {
    e.waitUntil(SyncStrategy.syncMessages());
  }
});

/** ── Push Notifications ── */
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? { title: 'Chattify', body: 'New message' };
  e.waitUntil(PushStrategy.showNotification(self.registration, data));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(PushStrategy.handleClick(e));
});

/** ── Message from client ── */
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'GET_VERSION')  e.ports[0]?.postMessage({ version: SW_VERSION });
});
