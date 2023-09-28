const SW_VERSION = 1;
const CACHE_NAME = "COUNTRY_PROVINCE_CITY";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll([
          "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries.json",
          "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/states.json",
          "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/cities.json",
        ])
      )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName == CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
