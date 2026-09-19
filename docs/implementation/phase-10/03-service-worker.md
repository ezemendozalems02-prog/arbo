# ARBO OS — FASE 10: SERVICE WORKER & ESTRATEGIA DE CACHÉ
## Aislamiento Estricto y Ciclo de Vida

### 1. Archivo y Versión
Implementado en `public/sw.js` bajo el identificador `arbo-static-v1.10.0`.

### 2. Aislamiento de Datos Públicos vs Privados (Regla Crítica)
El Service Worker segrega de forma absoluta:
- **Activos Estáticos (Static Assets):** HTML, CSS, JS, SVG, fuentes y manifest se gestionan mediante estrategia Stale-While-Revalidate o Cache-First para garantizar arranque instantáneo aún sin conexión.
- **Llamadas a API y Datos Transaccionales (Private & Transactional API):** Todas las URLs que contienen `/rest/v1/`, `/auth/v1/`, `supabase.co` o métodos POST/PUT/DELETE se excluyen explícitamente del caché público. Pasan directo a la red.
- **Seguridad Multi-Tenant:** Bajo ninguna circunstancia se almacenan tokens JWT, datos de clientes o información fiscal en cachés compartidos del navegador.
