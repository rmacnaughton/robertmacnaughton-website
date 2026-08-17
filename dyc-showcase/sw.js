/* DYC Impact Showcase — offline cache.
   Bump CACHE when you upload a new version of the page. */
var CACHE = 'dyc-showcase-v3';
var ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

/* stale-while-revalidate: instant from cache, refreshed in the background */
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(function(cache){
      return cache.match(e.request, {ignoreSearch:true}).then(function(hit){
        var net = fetch(e.request).then(function(res){
          if(res && res.status === 200 && res.type === 'basic') cache.put(e.request, res.clone());
          return res;
        }).catch(function(){ return hit; });
        return hit || net;
      });
    })
  );
});
