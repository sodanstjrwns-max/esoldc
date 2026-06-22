// 이솔치과의원 PWA Service Worker 소스 (문자열).
// /sw.js 라우트에서 그대로 서빙 → scope '/' 확보 (정적 /static/* 제외 라우팅 우회).
export const SERVICE_WORKER_JS = `/* 이솔치과의원 PWA Service Worker
   전략:
   - HTML 문서(navigate): network-first → 항상 최신 정보 우선, 오프라인 시 캐시 폴백
   - 정적 자산(css/js/img/font): cache-first → 재방문 시 즉시 로딩 (체감 속도 ↑)
   의료 정보 특성상 콘텐츠 최신성을 위해 HTML은 stale 캐시를 우선하지 않음. */
const VERSION = 'isoldent-v1';
const STATIC_CACHE = 'static-' + VERSION;
const RUNTIME_CACHE = 'runtime-' + VERSION;

const PRECACHE = [
  '/',
  '/static/img/icon-192.png',
  '/static/img/favicon.svg',
  '/static/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return;

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('/')))
    );
    return;
  }

  if (/\\.(?:css|js|png|jpg|jpeg|webp|svg|woff2?|ttf|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        });
      })
    );
  }
});
`;
