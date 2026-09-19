# ARBO OS — FASE 10: PWA & MANIFEST
## Instalabilidad y Configuración de Aplicación Web Progresiva

### 1. Web App Manifest
Ubicado en `public/manifest.webmanifest`:
- Nombre: `ARBO OS — Operación Gastronómica`
- Short name: `ARBO OS`
- Display mode: `standalone` (sin interfaz de navegador, pantalla completa nativa)
- Start URL: `/admin`
- Theme & Background: `#1F402F` (Verde Arbo normativo)
- Shortcuts operacionales: Acceso directo a POS (`/admin/pos`), Cocina (`/admin/cocina`) y Caja (`/admin/caja`).

### 2. Soporte Móvil y Tabletas
El archivo `index.html` incluye metaetiquetas específicas para iOS y Android:
- `apple-mobile-web-app-capable`: `yes`
- `apple-mobile-web-app-status-bar-style`: `black-translucent`
- `apple-mobile-web-app-title`: `ARBO OS`
- `viewport-fit=cover` para compatibilidad con notch y áreas seguras.
