const STATIC_CACHE_NAME = "static-cachev0.1";
const INMUTABLE_CACHE_NAME = "inmutable-cache-v0.1";
const DYNAMIC_CACHE_NAME = "dynamic-caches-v0.1";

function cleanCache(cacheName, numberItems){
  caches.open(cacheName).then((cache)=>{
    cache.keys().then((keys)=>{
      if(keys.length > numberItems){
        cache.delete(keys[0]).then(()=>{
          return cleanCache(cacheName, numberItems);
        });
      }
    });
  });
}

self.addEventListener("install", (event) => {
  console.log("Se inicializó");
  const promiseCache = caches.open(STATIC_CACHE_NAME).then((cache) => {
    return cache.addAll([
      "./",
      "./index.html",
    ]);
  });

  const promiseCacheInmutable = caches
    .open(INMUTABLE_CACHE_NAME)
    .then((cache) => {
      return cache.addAll([
        "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css",
        "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css",
      ]);
    });

  event.waitUntil(Promise.all([promiseCache, promiseCacheInmutable]));
});


//Cahe with network fallback
self.addEventListener("fetch", (event) => {
  const respuestaCahe = caches.match(event.request).then((resp) => {
    if (resp) {
      return resp;
    }
    return fetch(event.request).then((respuestaVer) => {
      
      caches.open(DYNAMIC_CACHE_NAME)
      .then((cache)=>{
        cache.put(event.request, respuestaVer);
        cleanCache(DYNAMIC_CACHE_NAME, 10);
      });
      return respuestaVer.clone();
    });
  });
  event.respondWith(respuestaCahe);
});