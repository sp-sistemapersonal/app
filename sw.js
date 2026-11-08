/* SP · puerta (diseño 191): guarda solo la cáscara de la puerta, para abrirla rápido. Nunca datos del cliente:
   lo que va a SP WEB, a Google o a otro sitio pasa directo y no se guarda. */
const CACHE = "sp-puerta-e21bfaba4a";
const CASCARA = ["/", "/manifest.webmanifest", "/iconos/icono-192.png", "/iconos/icono-512.png", "/iconos/favicon-48.png"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CASCARA)).then(() => self.skipWaiting())); });

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(L => Promise.all(L.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  // Una página abierta con ?gm= no se guarda: la cáscara siempre es «/»
  const clave = e.request.mode === "navigate" ? "/" : u.pathname;
  if (!CASCARA.includes(clave)) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(clave, copia)); }
    return r;
  }).catch(() => caches.match(clave)));
});
