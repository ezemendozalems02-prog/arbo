// ARBO OS — SERVICE WORKER (PWA & OFFLINE RESILIENCE)
// Version: 1.10.0
// Reglas de Oro:
// 1. Aislar estrictamente STATIC ASSETS de PRIVATE/TRANSACTIONAL DATA.
// 2. NUNCA almacenar datos privados o tokens de sesión en caches públicos compartidos.
// 3. Ofrecer resiliencia offline para activos estáticos y navegación de la aplicación.

const CACHE_VERSION = 'arbo-static-v1.10.0'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
]

// Rutas de API o backend que NUNCA deben ser cacheadas por el Service Worker
const PRIVATE_API_PATTERNS = [
  '/rest/v1/',
  '/auth/v1/',
  '/storage/v1/',
  'supabase.co',
  '/api/',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url)

  // 1. REGLA DE SEGURIDAD: Transacciones privadas y llamadas API van DIRECTAS A LA RED
  const isPrivateApi = PRIVATE_API_PATTERNS.some((pattern) => event.request.url.includes(pattern))
  if (isPrivateApi || event.request.method !== 'GET') {
    // Pasar directo a la red sin interceptar ni almacenar en caché del Service Worker
    event.respondWith(
      fetch(event.request).catch((error) => {
        // La capa de dominio (IndexedDB Outbox) se encarga de la resiliencia transaccional
        return Promise.reject(error)
      })
    )
    return
  }

  // 2. NAVEGACIÓN SPA: Retornar index.html cacheado si la red no responde (Offline Fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html')
      })
    )
    return
  }

  // 3. ACTIVOS ESTÁTICOS (JS, CSS, Imágenes, Fuentes): Stale-While-Revalidate o Cache-First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidar en segundo plano para mantener assets actualizados
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request, networkResponse)
            })
          }
        }).catch(() => {/* Silencioso en modo offline */})

        return cachedResponse
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse
        }

        const responseToCache = networkResponse.clone()
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return networkResponse
      }).catch(() => {
        // Si no hay red ni caché para imagen, se puede retornar fallback
        return new Response('Offline Asset Not Available', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        })
      })
    })
  )
})
