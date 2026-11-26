const CACHE_NAME = "deadline-v83";
const BASE_URL = new URL("./", self.location.href);
const CACHEABLE_DESTINATIONS = new Set(["document", "font", "image", "script", "style"]);
const CORE_DOCUMENTS = new Set([
  "",
  "index.html",
  "app/",
  "app/index.html",
  "en/",
  "en/index.html",
  "th/",
  "th/index.html"
].map(path => new URL(path, BASE_URL).pathname));
const CORE_ASSETS = [
  "",
  "index.html",
  "app/",
  "app/index.html",
  "en/",
  "en/index.html",
  "signup/",
  "contact/",
  "install/",
  "th/",
  "th/index.html",
  "style.css",
  "script.js",
  "site-pages.js",
  "supabase-auth.js",
  "supabase-config.js",
  "Asset/supabase-js-2.119.2.js",
  "manifest.webmanifest",
  "Asset/Deadline-512.png",
  "Asset/Deadline-white-512.png",
  "Asset/Deadline-192.png",
  "Asset/Deadline-maskable.png"
].map(path => new URL(path, BASE_URL).href);

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  if (!CACHEABLE_DESTINATIONS.has(event.request.destination)) return;

  if (event.request.destination === "document"
    || event.request.destination === "style"
    || event.request.destination === "script") {
    const cacheOptions = event.request.destination === "document"
      && CORE_DOCUMENTS.has(new URL(event.request.url).pathname)
      ? { ignoreSearch: true }
      : undefined;
    const update = fetch(event.request).then(response => {
      if (!response.ok || response.type !== "basic") return response;

      const responseToCache = response.clone();
      return caches.open(CACHE_NAME)
        .then(cache => cache.put(event.request, responseToCache))
        .catch(error => {
          console.error("Could not cache a site response:", error);
        })
        .then(() => response);
    });
    event.waitUntil(update.then(() => undefined, () => undefined));
    event.respondWith(
      caches.match(event.request, cacheOptions).then(cachedResponse =>
        cachedResponse || update
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(response => {
        if (!response.ok || response.type !== "basic") return response;

        const responseToCache = response.clone();
        return caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseToCache))
          .catch(error => {
            console.error("Could not cache a site response:", error);
          })
          .then(() => response);
      });
    })
  );
});
