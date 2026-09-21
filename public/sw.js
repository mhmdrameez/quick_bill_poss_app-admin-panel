// public/sw.js — Cache-First for static assets, Stale-While-Revalidate for HTML
// Version bump forces SW update on all devices
const CACHE_VERSION = 'v3';
const STATIC_CACHE = `qbpos-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `qbpos-dynamic-${CACHE_VERSION}`;

// Static assets to pre-cache on install (Cache-First)
const PRECACHE_ASSETS = [
  '/icon.svg',
  '/logo.svg',
  '/favicon.ico',
  '/manifest.webmanifest',
];

// Patterns for static assets that should ALWAYS use cache-first
const STATIC_PATTERNS = [
  /\/_next\/static\//,    // Next.js compiled JS/CSS chunks
  /\/icon\.svg/,
  /\/logo\.svg/,
  /\/favicon\.ico/,
  /\/manifest\.webmanifest/,
  /\.woff2?$/,            // fonts
  /\.png$/, /\.jpg$/, /\.webp$/, /\.svg$/,
];

// Patterns to NEVER cache (Firestore, Auth API, analytics)
const NEVER_CACHE_PATTERNS = [
  /firestore\.googleapis\.com/,
  /identitytoolkit\.googleapis\.com/,
  /securetoken\.googleapis\.com/,
  /firebase\.googleapis\.com/,
  /analytics/,
  /gtag/,
];

// ── Install: pre-cache static shell ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache notice:', err);
      })
    )
  );
  self.skipWaiting();
});

// ── Activate: delete old cache versions ──────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: smart caching strategy ────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== 'GET') return;

  // Only handle http/https
  if (!request.url.startsWith('http')) return;

  const url = new URL(request.url);

  // Never cache Firebase/API requests — always network
  if (NEVER_CACHE_PATTERNS.some((p) => p.test(request.url))) {
    return; // Let browser handle natively
  }

  // STRATEGY 1 — CACHE FIRST for static assets (JS chunks, CSS, images, fonts)
  if (STATIC_PATTERNS.some((p) => p.test(request.url))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // STRATEGY 2 — STALE WHILE REVALIDATE for HTML page navigations
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached); // Fall back to cached on offline

          // Return cached immediately if available, while refreshing in background
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // STRATEGY 3 — Network with cache fallback for everything else
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
