# ARBO OS — TARGET ARCHITECTURE & TECHNICAL BLUEPRINT
## Master Blueprint Index & Architecture Tracker

---

### METADATOS
- **Proyecto:** ARBO OS
- **Fase:** Target Architecture & Technical Blueprint
- **Fecha:** 19 de Septiembre de 2026
- **Estado:** DISEÑO TÉCNICO MAESTRO
- **Fuentes Primarias:**
  - `docs/research/arbo-os/` (Auditoría Forense ARBO OS: 28 capítulos + `FINAL-ARBO-OS-FORENSIC-AUDIT.md`)
  - `C:\docs\research\fudo\` (Auditoría Forense Fudo: 24 fases + `FINAL-FUDO-FORENSIC-AUDIT.md`)
  - `docs/research/fudo-vs-arbo/` (Auditoría Comparativa: 12 capítulos + `FINAL-FUDO-VS-ARBO-COMPARATIVE-AUDIT.md`)
  - `docs/product-strategy/` (Estrategia y Definición de Producto: 18 capítulos + `FINAL-ARBO-OS-PRODUCT-STRATEGY.md`)
- **Regla Metodológica Fundamental:** Cero código, cero migraciones vivas, cero dependencias instaladas. Diseño formal, riguroso y de nivel enterprise para guiar la fase de implementación definitiva.

---

## ÍNDICE GENERAL DEL BLUEPRINT ARQUITECTÓNICO

| Cap. | Archivo | Título del Blueprint | Estado |
| :--- | :--- | :--- | :--- |
| **00** | [`00-index.md`](file:///c:/Users/Thiago/arbo/docs/architecture/00-index.md) | Índice Maestro, Estado y Convenciones de Arquitectura | Completo |
| **01** | [`01-architecture-principles.md`](file:///c:/Users/Thiago/arbo/docs/architecture/01-architecture-principles.md) | Los 10 Principios Arquitectónicos Rectores de ARBO OS | Completo |
| **02** | [`02-target-stack.md`](file:///c:/Users/Thiago/arbo/docs/architecture/02-target-stack.md) | Definición y Justificación del Stack Tecnológico Objetivo | Completo |
| **03** | [`03-system-architecture.md`](file:///c:/Users/Thiago/arbo/docs/architecture/03-system-architecture.md) | Arquitectura de Alto Nivel y Separación en 5 Capas | Completo |
| **04** | [`04-multitenancy.md`](file:///c:/Users/Thiago/arbo/docs/architecture/04-multitenancy.md) | Modelo Multi-Tenant y Multi-Sucursal Jerárquico | Completo |
| **05** | [`05-database-model.md`](file:///c:/Users/Thiago/arbo/docs/architecture/05-database-model.md) | Modelo Relacional PostgreSQL Exhaustivo (Esquema DDL Conceptual) | Completo |
| **06** | [`06-domain-model.md`](file:///c:/Users/Thiago/arbo/docs/architecture/06-domain-model.md) | Domain Model, Agregados, Entidades y Límites de Dominio (DDD) | Completo |
| **07** | [`07-inventory-architecture.md`](file:///c:/Users/Thiago/arbo/docs/architecture/07-inventory-architecture.md) | Motor de Inventario por Ledger Inmutable y Explosión de Recetas | Completo |
| **08** | [`08-sales-transactions.md`](file:///c:/Users/Thiago/arbo/docs/architecture/08-sales-transactions.md) | Pipeline de Transacciones de Venta ACID y Recuperación ante Fallos | Completo |
| **09** | [`09-cash-finance.md`](file:///c:/Users/Thiago/arbo/docs/architecture/09-cash-finance.md) | Arquitectura Financiera de Caja: Turnos, Arqueo Ciego e Inmutabilidad | Completo |
| **10** | [`10-kds-realtime.md`](file:///c:/Users/Thiago/arbo/docs/architecture/10-kds-realtime.md) | KDS y Realtime: WebSockets, Estados, Desconexión y Sincronía | Completo |
| **11** | [`11-crm-events.md`](file:///c:/Users/Thiago/arbo/docs/architecture/11-crm-events.md) | Event-Driven CRM: Arquitectura de Eventos de Dominio e Integración | Completo |
| **12** | [`12-arbo-club.md`](file:///c:/Users/Thiago/arbo/docs/architecture/12-arbo-club.md) | ARBO Club: Ledger de Puntos Transversal, Tiers y Canje en POS | Completo |
| **13** | [`13-automation.md`](file:///c:/Users/Thiago/arbo/docs/architecture/13-automation.md) | Motor de Automatización, Triggers, Workers e Idempotencia | Completo |
| **14** | [`14-intelligence.md`](file:///c:/Users/Thiago/arbo/docs/architecture/14-intelligence.md) | Capa de Inteligencia: Rule Engine Determinístico vs Analytics vs ML | Completo |
| **15** | [`15-fiscal-layer.md`](file:///c:/Users/Thiago/arbo/docs/architecture/15-fiscal-layer.md) | Capa Fiscal Argentina Desacoplada: AFIP/ARCA, CAE y Contingencia | Completo |
| **16** | [`16-public-commerce.md`](file:///c:/Users/Thiago/arbo/docs/architecture/16-public-commerce.md) | Comercio Público: Menú QR, Tienda Delivery y Reservas Aisladas | Completo |
| **17** | [`17-security.md`](file:///c:/Users/Thiago/arbo/docs/architecture/17-security.md) | Seguridad Integral: Auth, RBAC, RLS, Blindaje de `/admin` y Cifrado | Completo |
| **18** | [`18-offline-degraded.md`](file:///c:/Users/Thiago/arbo/docs/architecture/18-offline-degraded.md) | Modo Offline y Operación Degradada ante Cortes de Conectividad | Completo |
| **19** | [`19-performance.md`](file:///c:/Users/Thiago/arbo/docs/architecture/19-performance.md) | Estrategia de Rendimiento: Latencia, Bundle Splitting, Índices y Caching | Completo |
| **20** | [`20-migration.md`](file:///c:/Users/Thiago/arbo/docs/architecture/20-migration.md) | Estrategia de Migración Técnica: De Prototipo localStorage a BD | Completo |
| **21** | [`21-current-vs-target.md`](file:///c:/Users/Thiago/arbo/docs/architecture/21-current-vs-target.md) | Matriz Exhaustiva de Brechas: Código Actual vs Arquitectura Objetivo | Completo |
| **22** | [`22-api-boundaries.md`](file:///c:/Users/Thiago/arbo/docs/architecture/22-api-boundaries.md) | Diseño de Contratos de API: Commands, Queries, Eventos y Permisos | Completo |
| **23** | [`23-observability.md`](file:///c:/Users/Thiago/arbo/docs/architecture/23-observability.md) | Observabilidad: Structured Logging, Error Tracking, Auditoría y Métricas | Completo |
| **24** | [`24-backups-recovery.md`](file:///c:/Users/Thiago/arbo/docs/architecture/24-backups-recovery.md) | Estrategia de Respaldo, Retención, RPO/RTO y Disaster Recovery | Completo |
| **25** | [`25-testing-strategy.md`](file:///c:/Users/Thiago/arbo/docs/architecture/25-testing-strategy.md) | Arquitectura de Pruebas: Unit, Integration, E2E, Fiscal y RLS | Completo |
| **26** | [`26-implementation-dependencies.md`](file:///c:/Users/Thiago/arbo/docs/architecture/26-implementation-dependencies.md) | Grafo Estricto de Dependencias Técnicas de Implementación | Completo |
| **GATE** | [`IMPLEMENTATION-GATE.md`](file:///c:/Users/Thiago/arbo/docs/architecture/IMPLEMENTATION-GATE.md) | Compuerta de Implementación: Aprobaciones, Bloqueos y Vertical Slice | Completo |
| **REVIEW** | [`FINAL-ARBO-OS-ARCHITECTURE-REVIEW.md`](file:///c:/Users/Thiago/arbo/docs/architecture/FINAL-ARBO-OS-ARCHITECTURE-REVIEW.md) | Dictamen Técnico de Revisión y Validación de Consistencia | Completo |
| **FINAL** | [`FINAL-ARBO-OS-TARGET-ARCHITECTURE.md`](file:///c:/Users/Thiago/arbo/docs/architecture/FINAL-ARBO-OS-TARGET-ARCHITECTURE.md) | Blueprint Técnico Consolidado y Dictamen de Preparación | Completo |
