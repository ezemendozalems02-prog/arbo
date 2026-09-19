# 21 — Rendimiento, Bundle Size y Almacenamiento Local

**Archivos:** `vite.config.js`, `package.json`, `dist/`, `src/context/*`  
**Estado general:** `PARTIAL` — build rápido con Vite (1,03s); bundle monolítico sin code-splitting que fuerza a clientes públicos a descargar el sistema administrativo completo.

---

## 21.1 Métricas de Bundle en Producción

Compilación con Vite 8.0.8:
```
dist/index.html                   2.28 kB │ gzip:   0.90 kB
dist/assets/index-BPl5Jpmc.css   10.82 kB │ gzip:   2.82 kB
dist/assets/index-CUFzKwLD.js   761.04 kB │ gzip: 203.55 kB
```

### OBSERVED · P2 · Bundle Único Monolítico (Sin Code Splitting)
- En todo el proyecto **no existe una sola ocurrencia de `React.lazy()` ni `import()` dinámico**.
- **Consecuencia:** Un usuario que accede desde su celular con conexión 4G para ver la carta de cafés o la dirección del local descarga 761 kB de JavaScript que incluyen:
  - El sistema de punto de venta (POS) y visualizador de cocina (KDS).
  - El módulo de mermas, inventario y costeo de recetas.
  - La base de datos completa de 126 clientes y sus transacciones de fidelización.
  - Los simuladores de campañas de marketing y dashboards analíticos.

---

## 21.2 Cuota y Sobrecarga de `localStorage`

- **Medición de volumen inicial:**
  - `arbo_crm_v1`: ~176 KB
  - `arbo_inventory_v1`: ~44 KB
  - `arbo_pos_v1`: ~4 KB
- **Límite de navegador:** La cuota estándar de `localStorage` es de **5 MB** por origen.
- **Sobrecarga de CPU por serialización sincrónica:**
  Cada mutación (ej. agregar una nota o actualizar un consentimiento) dispara `useEffect` con `JSON.stringify(state)` sobre un payload de 176 KB en el hilo principal de JavaScript (`Main Thread`). En dispositivos móviles de mozos o comandas, esto genera congelamientos perceptibles de UI (jank).
