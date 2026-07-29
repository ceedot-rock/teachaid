/* teachaid-v26 — network-first shell; inject path-ui; never cache API */
const CACHE = 'teachaid-v26';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function injectPathUi(html) {
  if (/lib\/path-ui\.js/.test(html)) return html;
  const tag = '<script src="lib/path-ui.js"></script>';
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, tag + '</body>');
  return html + tag;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(req));
    return;
  }
  if (req.method !== 'GET') return;

  const isNav = req.mode === 'navigate';
  const isHtml =
    isNav ||
    url.pathname === '/' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('index.html') ||
    url.pathname.endsWith('.html');

  if (isHtml) {
    e.respondWith(
      fetch(req)
        .then(async (res) => {
          const ct = res.headers.get('content-type') || '';
          if (!ct.includes('text/html') && !isNav) return res;
          const text = await res.text();
          const patched = injectPathUi(text);
          return new Response(patched, {
            status: res.status,
            statusText: res.statusText,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-store',
            },
          });
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  const isShell =
    url.pathname.endsWith('sw.js') || url.pathname.endsWith('manifest.webmanifest');

  if (isShell) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
