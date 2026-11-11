// Keeps a copy of the app on the phone so it opens without internet.
// Your family data is NOT stored here: it stays in the app's own storage on the phone.
var CACHE = "familytree-app-v1";
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Open instantly from the saved copy; if online, quietly fetch a newer copy for next time
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (cached) {
      var fresh = fetch(event.request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        }
        return response;
      }).catch(function () { return cached; });
      return cached || fresh;
    })
  );
});
