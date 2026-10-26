const CACHE = 'creaweb-chach-v3';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './logo-blanco.png',
  './js/app.js',
  './js/gallery.js',
  './js/config.js',
  './js/utils.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Solo interceptar peticiones same-origin; evitar generar errores CORS/FetchEvent en dominios externos
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});