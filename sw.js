const CACHE_NAME = "deadline-v19";
const BASE_URL = new URL("./", self.location.href);
const CORE_ASSETS = [
  "",
  "app/",
  "signup/",
  "style.css",
  "script.js",
  "site-pages.js",
  "supabase-auth.js",
  "supabase-config.js",
  "Asset/supabase-js-2.119.2.js",
  "manifest.webmanifest",
  "Asset/Deadline-512.png",
  "Asset/Deadline-white-512.png"
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
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
