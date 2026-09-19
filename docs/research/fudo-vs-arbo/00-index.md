# FUDO vs ARBO OS — Forensic Comparative Audit
## Índice Maestro y Trazabilidad Documental

**Ubicación:** `docs/research/fudo-vs-arbo/`  
**Fecha de finalización:** 19 de septiembre de 2026  
**Fuentes primarias oficiales:**  
1. **ARBO OS:** [`docs/research/arbo-os/`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/) (Commit `52c01cb`, 28 capítulos, 10 capturas en `evidence/`, dictamen en `FINAL-ARBO-OS-FORENSIC-AUDIT.md`).
2. **FUDO:** `C:\docs\research\fudo\` (24 fases completas, 118 artículos de helpcenter en `raw/`, OpenAPI v1alpha1 spec, 58 evidencias `E01-E58`, dictamen en `FINAL-FUDO-FORENSIC-AUDIT.md`).

---

## 1. Reglas Metodológicas Aplicadas

- **Cero opiniones y cero rankings:** Sin juicios emocionales ni puntuaciones arbitrarias.
- **Sistema de evidencia riguroso:** `FACT`, `DOCUMENTED`, `OBSERVED`, `INFERENCE`, `HYPOTHESIS`, `UNKNOWN`.
- **Estados de madurez operativa:** `CONFIRMED_WORKING`, `PARTIAL`, `BROKEN`, `INCOMPLETE`, `UI_ONLY`, `CODE_ONLY`, `NOT_IMPLEMENTED`, `NOT_TESTED`, `REQUIRES_INTERVENTION`.
- **Distinción analítica:** `GAP` (brecha), `DIFERENCIA DE IMPLEMENTACIÓN` y `OPORTUNIDAD`.

---

## 2. Mapa Completo de Documentos Comparativos

| Archivo | Áreas / Categorías Cubiertas | Estado |
|---|---|---|
| [`00-index.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/00-index.md) | Índice maestro, metodología y trazabilidad | `COMPLETADO` |
| [`01-architecture-persistence.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/01-architecture-persistence.md) | Arquitectura, persistencia, APIs, sync, auth y permisos (Cat. 1, 2, 3, 31, 32, 39) | `COMPLETADO` |
| [`02-pos-floor-kitchen.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/02-pos-floor-kitchen.md) | POS, salón, mesas, comandas, KDS (Cat. 4, 5, 6, 7, 8) | `COMPLETADO` |
| [`03-inventory-costing.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/03-inventory-costing.md) | Stock, compras, proveedores, recetas, subrecetas, costos, modificadores (Cat. 9-16) | `COMPLETADO` |
| [`04-cash-finance-fiscal.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/04-cash-finance-fiscal.md) | Caja, arqueos, finanzas, facturación fiscal AFIP/ARCA (Cat. 17, 18, 19, 28) | `COMPLETADO` |
| [`05-customers-crm-loyalty-marketing.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/05-customers-crm-loyalty-marketing.md) | Clientes, CRM, fidelización, marketing, automatizaciones, IA (Cat. 20, 21, 22, 23, 33, 34) | `COMPLETADO` |
| [`06-public-delivery-ecommerce.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/06-public-delivery-ecommerce.md) | Delivery, pedidos online, reservas, sitio público, menú QR (Cat. 24, 25, 26, 27) | `COMPLETADO` |
| [`07-scale-multibranch-franchise.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/07-scale-multibranch-franchise.md) | Multi-sucursal, franquicias, dark kitchens (Cat. 29, 30) | `COMPLETADO` |
| [`08-ux-responsive-accessibility.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/08-ux-responsive-accessibility.md) | UX, responsive, accesibilidad, performance web (Cat. 35, 36, 37, 38) | `COMPLETADO` |
| [`09-e2e-real-operation-journeys.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/09-e2e-real-operation-journeys.md) | Comparación de los 15 flujos de operación real (Cat. 40, 43) | `COMPLETADO` |
| [`10-bugs-defects-matrix.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/10-bugs-defects-matrix.md) | Matriz completa de bugs comparados (Cat. 41) | `COMPLETADO` |
| [`11-critical-gaps.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/11-critical-gaps.md) | Gaps críticos de ARBO OS jerarquizados P0 a P3 (Cat. 42) | `COMPLETADO` |
| [`12-opportunities-differentiation.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/12-opportunities-differentiation.md) | Oportunidades, qué NO copiar y áreas de diferenciación objetiva | `COMPLETADO` |
| [`FINAL-FUDO-VS-ARBO-COMPARATIVE-AUDIT.md`](file:///c:/Users/Thiago/arbo/docs/research/fudo-vs-arbo/FINAL-FUDO-VS-ARBO-COMPARATIVE-AUDIT.md) | Dictamen Maestro Consolidado, Matriz Maestra y Conclusión | `COMPLETADO` |
