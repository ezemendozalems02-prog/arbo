# 01 — Arquitectura

> Auditoría forense ARBO OS · fase de reconocimiento
> Estado del repo auditado: rama `main`, commit `52c01cb` ("ARBO OS: panel administrativo completo (Fases 1-5)")

## 1.1 Hallazgo estructural principal

**FACT · CONFIRMED** — ARBO OS **no tiene backend**. No existe Supabase, ni
base de datos, ni API, ni servidor de aplicación, ni autenticación. Es una
**SPA 100% cliente** construida con Vite + React, cuyos datos viven en
archivos `.js` estáticos (`src/mock/`) y cuyo estado mutable se persiste en
`localStorage` del navegador.

Evidencia:

- `package.json` — no hay `@supabase/supabase-js` ni ningún cliente HTTP.
  Dependencias de runtime completas: `react`, `react-dom`, `react-router-dom`,
  `framer-motion`, `tailwindcss`, `@tailwindcss/vite`.
- Búsqueda en todo `src/`: **cero** ocurrencias de `fetch(`, `axios`,
  `createClient`, `import.meta.env`, `process.env`, `WebSocket`.
- Las únicas 8 ocurrencias de la palabra "supabase" en el código son
  **comentarios** que describen una migración futura, no código. Ej.
  `src/context/POSContext.jsx:12-15`.
- No existe carpeta `supabase/`, ni `migrations/`, ni `.env*`, ni
  `schema.sql`, ni functions/edge functions.

Consecuencia directa para el alcance de esta auditoría: las secciones del
brief que asumen Supabase (RLS, policies, triggers, foreign keys, índices,
aislamiento multi-tenant, endpoints, webhooks, rate limits) **no tienen
objeto que auditar**. Se documentan como `NOT_IMPLEMENTED` con la evidencia
correspondiente, no como "no verificado".

## 1.2 Stack

| Capa | Tecnología | Versión | Fuente |
|---|---|---|---|
| Build | Vite | 8.0.8 | `package.json`, salida de `npm run build` |
| Framework | React | 19.2.4 | `package.json` |
| Routing | react-router-dom | 7.14.0 | `package.json` |
| Estilos | Tailwind CSS v4 (plugin Vite) + estilos inline | 4.2.2 | `vite.config.js` |
| Animación | framer-motion | 12.38.0 | `package.json` |
| Lenguaje | JavaScript (JSX). **Sin TypeScript** | — | ausencia de `tsconfig.json` |
| Package manager | npm (`package-lock.json` v3) | npm 11.11.0 | lockfile |
| Runtime de build | Node v24.14.1 | — | entorno local |
| Deploy | Vercel (SPA rewrite a `index.html`) | — | `vercel.json` |
| Tests | **ninguno** | — | sin runner, sin archivos `*.test.*`/`*.spec.*` |

`vercel.json` contiene únicamente un rewrite catch-all — sin headers de
seguridad, sin CSP, sin caché explícita.

## 1.3 Estructura del proyecto

184 archivos en `src/`, **12.780 líneas** de JS/JSX/CSS.

```
src/
├── main.jsx              entry point (createRoot + StrictMode)
├── App.jsx               router raíz: separa sitio público de /admin
├── index.css             estilos globales + tokens Tailwind
├── styles/theme.js       COLORS / FONTS (design tokens en JS)
│
├── pages/                8 páginas del SITIO PÚBLICO
├── sections/home/        12 secciones de la home
├── components/           Navbar, Footer, CartDrawer, WhatsAppButton, ui/
├── hooks/                useCart, useLockBodyScroll, useMediaQuery, useReveal
├── data/                 contenido editorial (menu, events, site, benefits, franchise)
│
├── admin/                ARBO OS — el panel administrativo
│   ├── AdminApp.jsx      router del admin + árbol de providers
│   ├── nav.config.js     fuente única de navegación (sidebar + rutas)
│   ├── layout/           AdminLayout, AdminSidebar
│   ├── pages/            29 páginas implementadas + ComingSoon
│   ├── components/       componentes por módulo (pos/, kitchen/, inventory/, crm/)
│   ├── context/          ToastContext
│   └── utils/            format.js, period.js
│
├── context/              LOS "3 CONTEXTOS-BASE-DE-DATOS" + CartContext
│   ├── POSContext.jsx        mesas, órdenes, ventas, comandas, caja
│   ├── InventoryContext.jsx  insumos, recetas, compras, proveedores, mermas
│   └── CRMContext.jsx        clientes, puntos, canjes, segmentos, campañas
│
├── services/             22 módulos de lógica de negocio (funciones puras)
└── mock/                 25 archivos: LOS DATOS (semilla + catálogos + config)
```

## 1.4 Entry points y routing

`src/main.jsx` monta `<App/>` dentro de `<StrictMode>`.

`src/App.jsx:88-95` — el router raíz parte la aplicación en dos mundos que no
comparten layout ni providers:

| Patrón | Destino | Providers activos |
|---|---|---|
| `/admin/*` | `<AdminApp/>` | ToastProvider → POSProvider → InventoryProvider → CRMProvider |
| `/*` | `<PublicShell/>` | sólo CartProvider (declarado en la raíz) |

**Sitio público** (`App.jsx:54-65`) — 9 rutas: `/`, `/carta`, `/pedidos`,
`/reservas`, `/eventos`, `/franquicia`, `/arbo-club`, `/privacidad`,
`/terminos`. La ruta comodín `*` renderiza `<Home/>`.

**OBSERVED · P3** — no existe página 404: cualquier URL inexistente del sitio
público devuelve la home con status 200. Afecta SEO y orientación del usuario.

**ARBO OS** (`src/admin/AdminApp.jsx`) — las rutas se generan desde
`nav.config.js`. El mapa `PAGES` (líneas 58-88) asocia 29 rutas a componentes
reales; las entradas de `nav.config.js` sin componente caen al fallback
`<ComingSoon/>`. Además hay 8 `DETAIL_ROUTES` (líneas 92-101) que no tienen
entrada en el sidebar.

**OBSERVED · P3** — el router de `/admin` no declara ruta comodín. Una URL
como `/admin/inexistente` renderiza el `AdminLayout` (sidebar + header con
título "ARBO OS") con el área de contenido **vacía**, sin mensaje de error.

## 1.5 Árbol de providers

`AdminApp.jsx:105-129` anida cuatro providers. Los tres contextos de datos
(`POSProvider`, `InventoryProvider`, `CRMProvider`) montan **sólo dentro de
`/admin`**: el sitio público no los carga.

**INFERENCE** — el anidamiento es plano y sin memoización de los objetos
`value`. Cada uno construye su `value` como objeto literal nuevo en cada
render (`POSContext.jsx:359`, `InventoryContext.jsx:226`,
`CRMContext.jsx:250`), por lo que cualquier cambio de estado en uno de ellos
re-renderiza **todos** sus consumidores. Ver `21-performance.md`.

## 1.6 Servicios

22 módulos en `src/services/` concentran la lógica de negocio como funciones
puras, desacopladas de React. Es la decisión arquitectónica más sólida del
proyecto: `salesCalculations.js`, `cashCalculations.js`, `kitchenService.js`,
`recipeCostService.js`, `inventoryCostService.js`, `purchaseService.js`,
`unitService.js`, `segmentService.js`, `customerAnalyticsService.js`, etc.

**FACT** — ninguno de estos módulos tiene tests. La lógica de dinero, costos
y stock está centralizada y es testeable, pero no está testeada.

## 1.7 Configuración y variables de entorno

**FACT · NOT_IMPLEMENTED** — el proyecto no usa variables de entorno. No hay
`.env`, `.env.example`, ni lecturas de `import.meta.env`. No hay feature flags
en runtime: el equivalente funcional es el campo `available: true|false` de
`nav.config.js`, que se resuelve en build.

## 1.8 Build

`npm run build` compila sin errores en ~830 ms. `npm run lint` pasa **limpio**
(0 errores, 0 warnings).

Salida del bundle de producción:

```
dist/index.html                   2.28 kB │ gzip:   0.89 kB
dist/assets/index-CeuxsIU3.css    9.71 kB │ gzip:   2.67 kB
dist/assets/index-DD2fqcdO.js   761.04 kB │ gzip: 203.55 kB
```

**OBSERVED · P2** — un único chunk JS de 761 kB. No hay code-splitting: no se
usa `React.lazy`, `Suspense` ni `import()` dinámico en ningún archivo. Un
visitante del sitio público descarga íntegro el panel administrativo
(POS, KDS, inventario, CRM, analytics) antes de ver la home. Ver
`21-performance.md` y `23-security.md`.
