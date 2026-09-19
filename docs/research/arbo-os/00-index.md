# ARBO OS — Índice Maestro de la Auditoría Forense

**Proyecto:** ARBO OS (commit `52c01cb`)  
**Tipo de sistema:** SPA React 19 + Vite + Tailwind CSS v4. Sin backend, datos en memoria y `localStorage`.  
**Alcance:** Código fuente y runtime completo de ARBO OS (`src/admin/`, `src/context/`, `src/services/`, `src/mock/`, `src/pages/`).  
**Metodología aplicada:**  
- Calificaciones: `FACT`, `OBSERVED`, `DOCUMENTED`, `INFERENCE`, `HYPOTHESIS`, `UNKNOWN`.  
- Estados: `CONFIRMED_WORKING`, `PARTIAL`, `BROKEN`, `INCOMPLETE`, `UI_ONLY`, `CODE_ONLY`, `NOT_IMPLEMENTED`, `NOT_TESTED`, `REQUIRES_INTERVENTION`.  
- Modo: Sólo lectura estricta. Cero mutaciones destructivas.

---

## Mapa Completo de Documentos de la Auditoría

| Doc | Título / Módulo | Estado de Auditoría | Estado del Módulo |
|---|---|---|---|
| [`01-architecture.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/01-architecture.md) | Arquitectura y Stack | `COMPLETADO` | `PARTIAL` (SPA cliente sin backend) |
| [`02-database.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/02-database.md) | Persistencia y Modelo de Datos | `COMPLETADO` | `NOT_IMPLEMENTED` (sólo localStorage) |
| [`03-auth-permissions.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/03-auth-permissions.md) | Autenticación y Permisos | `COMPLETADO` | `NOT_IMPLEMENTED` (sin login ni roles) |
| [`04-pos.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/04-pos.md) | Punto de Venta (POS) | `COMPLETADO` | `PARTIAL` (BUG-003, BUG-007) |
| [`05-tables-orders.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/05-tables-orders.md) | Mesas y Órdenes | `COMPLETADO` | `PARTIAL` (split bill UI_ONLY) |
| [`06-kds.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/06-kds.md) | Cocina y KDS | `COMPLETADO` | `PARTIAL` (BUG-004 comanda huérfana) |
| [`07-products.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/07-products.md) | Catálogo y Productos | `COMPLETADO` | `CODE_ONLY` (no administrable) |
| [`08-recipes-costs.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/08-recipes-costs.md) | Recetas y Costos | `COMPLETADO` | `CONFIRMED_WORKING` (cálculo aislado) |
| [`09-modifiers.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/09-modifiers.md) | Modificadores | `COMPLETADO` | `PARTIAL` (sin impacto en stock) |
| [`10-stock.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/10-stock.md) | Stock e Inventario | `COMPLETADO` | `PARTIAL` (ventas no descuentan stock) |
| [`11-purchases-suppliers.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/11-purchases-suppliers.md) | Compras y Proveedores | `COMPLETADO` | `PARTIAL` (costeo ponderado OK, sin caja) |
| [`12-cash-register.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/12-cash-register.md) | Caja y Arqueos | `COMPLETADO` | `PARTIAL` (BUG-018 borrado de historial) |
| [`13-crm-customers.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/13-crm-customers.md) | Clientes y CRM | `COMPLETADO` | `PARTIAL` (BUG-006 desconectado de POS) |
| [`14-loyalty-arbo-club.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/14-loyalty-arbo-club.md) | Fidelización y ARBO Club | `COMPLETADO` | `PARTIAL` (BUG-021 canjes no entran a POS) |
| [`15-marketing-automations.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/15-marketing-automations.md) | Marketing y Automatizaciones | `COMPLETADO` | `UI_ONLY` / `SIMULATED` (sin canales reales) |
| [`16-costing-analytics.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/16-costing-analytics.md) | Costos, Análisis y Dashboards | `COMPLETADO` | `PARTIAL` (BUG-005 dashboard ciego a POS) |
| [`17-fiscal-billing.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/17-fiscal-billing.md) | Facturación y Régimen Fiscal | `COMPLETADO` | `NOT_IMPLEMENTED` (cero AFIP/ARCA) |
| [`18-multibranch-scale.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/18-multibranch-scale.md) | Multi-sucursal y Franquicia | `COMPLETADO` | `NOT_IMPLEMENTED` (monolocal, BUG-024) |
| [`19-public-vs-admin.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/19-public-vs-admin.md) | Sitio Público vs Admin | `COMPLETADO` | `BROKEN` (dos mundos desconectados) |
| [`20-code-quality.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/20-code-quality.md) | Calidad de Código y Arquitectura | `COMPLETADO` | `PARTIAL` (servicios puros OK, sin tests) |
| [`21-performance.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/21-performance.md) | Rendimiento y Bundle | `COMPLETADO` | `PARTIAL` (bundle único 761 kB sin split) |
| [`22-ux-accessibility.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/22-ux-accessibility.md) | UX, Responsive y A11y | `COMPLETADO` | `PARTIAL` (BUG-007 POS roto en mobile) |
| [`23-security.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/23-security.md) | Seguridad y Superficie de Ataque | `COMPLETADO` | `BROKEN` (exposición pública de PII) |
| [`24-end-to-end-journeys.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/24-end-to-end-journeys.md) | Journeys Operativos Verificados | `COMPLETADO` | 5 flujos auditados en vivo |
| [`25-bugs.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/25-bugs.md) | Registro de Bugs y Defectos | `COMPLETADO` | 24 defectos clasificados P0-P3 |
| [`26-product-gaps.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/26-product-gaps.md) | Brechas de Producto Gastronómico | `COMPLETADO` | 10 omisiones esenciales detalladas |
| [`27-target-architecture.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/27-target-architecture.md) | Plan de Migración a Supabase | `COMPLETADO` | Esquema relacional, triggers y RLS |
| [`28-open-questions.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/28-open-questions.md) | Intervenciones y Decisiones | `COMPLETADO` | Checklist de decisiones urgentes |
| [`FINAL-ARBO-OS-FORENSIC-AUDIT.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/FINAL-ARBO-OS-FORENSIC-AUDIT.md) | Dictamen Forense Final Consolidado | `EN CREACIÓN` | Documento de cierre maestro |
