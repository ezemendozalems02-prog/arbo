# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 13. RENDIMIENTO DE LA WEB PÚBLICA (PUBLIC PERFORMANCE)

---

## 1. OBJETIVO ARQUITECTÓNICO

La Product Strategy y Blueprint de ARBO OS estipulan que la web pública orientada al consumidor final debe ser **extremadamente ágil y ligera**:
- **Meta de Transferencia Inicial**: $< 300\text{ KB}$ comprimido (gzip/brotli).
- **First Contentful Paint (FCP)**: $< 1.2\text{ s}$ en redes móviles 4G.
- **Time to Interactive (TTI)**: $< 2.0\text{ s}$.

---

## 2. AUDITORÍA DEL BUNDLE ACTUAL

En la compilación de producción actual (`vite build`):
- `dist/assets/index-tDDcuJPg.js`: **988.42 kB** (gzip: **262.26 kB**).
- `dist/assets/index-TUhtV0i8.css`: **9.74 kB** (gzip: **2.67 kB**).

### Hallazgo Clave:
Actualmente, la aplicación carga todo el código administrativo (`AdminApp`, módulos de CRM, reportes, inventario, KDS) dentro del mismo chunk principal de JavaScript.

### Recomendaciones para Fase 6:
1. **Code-Splitting Dinámico con `React.lazy()` / Dynamic Imports**:
   - Separar el bundle público (`PublicShell`, `Home`, `Carta`, `Pedidos`) del bundle privado (`AdminApp`, `KDS`, `POS`).
   - Un cliente que sólo desea pedir un café nunca debe descargar el código del KDS o de conciliación de cajas.
2. **Optimización de Imágenes**:
   - Implementar formatos WebP / AVIF con `loading="lazy"` para la carta visual.
3. **Caché CDN / Edge**:
   - El catálogo público es de lectura intensiva. Las consultas a `get_public_catalog` pueden cachearse con TTL corto (e.g. 60s - Stale-While-Revalidate) en la CDN (Vercel Edge Network), aliviando la carga sobre PostgreSQL.
