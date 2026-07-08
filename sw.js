const CACHE_NAME = 'reservoir-quest-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './assets/css/styles.css',
  './assets/js/data.js',
  './assets/js/sanitize.js',
  './assets/js/state.js',
  './assets/js/audio.js',
  './assets/js/particle-system.js',
  './assets/js/theme-system.js',
  './assets/js/analytics.js',
  './assets/js/performance.js',
  './assets/js/sync-manager.js',
  './assets/js/privacy.js',
  './assets/js/router.js',
  './assets/js/map.js',
  './assets/js/games/game-engine.js',
  './assets/js/games/quiz.js',
  './assets/js/games/guess.js',
  './assets/js/games/memory.js',
  './assets/js/games/wheel.js',
  './assets/js/games/challenge30.js',
  './assets/js/games/jigsaw.js',
  './assets/js/games/wordsearch.js',
  './assets/js/games/snake.js',
  './assets/js/games/typing.js',
  './assets/js/shop.js',
  './assets/js/achievements.js',
  './assets/js/ui.js',
  './assets/js/app.js',
  // Local audio files
  './assets/audio/Glass Puzzle Fields.mp3',
  './assets/audio/clever-little-paths.mp3',
  './assets/audio/credits.mp3',
  './assets/audio/correct.mp3',
  './assets/audio/wrong.mp3',
  './assets/audio/click.mp3',
  './assets/audio/paper.mp3',
  // Leaflet CDN files
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // Cache-first strategy for static assets and CDNs
  if (STATIC_ASSETS.includes(e.request.url) || STATIC_ASSETS.includes(url.pathname) || url.host === 'unpkg.com') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Network-first strategy for dynamic Wikipedia/Wikimedia API queries with fallback
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok && (url.host.includes('wikipedia.org') || url.host.includes('wikimedia.org'))) {
          const responseClone = response.clone();
          caches.open('reservoir-quest-dynamic').then(cache => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          // Return offline fallback if image fails
          if (e.request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0b1220"/><text x="50" y="55" font-family="sans-serif" font-size="10" fill="#8b94a7" text-anchor="middle">Offline 🌊</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        });
      })
  );
});
