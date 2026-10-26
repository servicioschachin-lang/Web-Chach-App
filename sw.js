const CACHE = 'creaweb-chach-v1';
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
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});