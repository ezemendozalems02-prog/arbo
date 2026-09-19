# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 17. CONSIDERACIONES DE RENDIMIENTO (PERFORMANCE)

---

## 1. TIMEOUT Y BLOQUEO DEL POS
- Se establece una cota superior estricta de 3.5 segundos para llamadas de autorización fiscal sincrónica.
- Si no hay respuesta dentro de ese intervalo, la interfaz libera la caja inmediatamente y delega la resolución al subsistema de contingencia en background.

## 2. INDEXACIÓN Y VOLUMETRÍA
- Índices compuestos en `fiscal_invoices(organization_id, branch_id)` y `fiscal_invoices(status)`.
- Índice parcial o compuesto en `fiscal_contingency_queue(status, next_attempt_at)` para que los workers de reintento seleccionen rápidamente los trabajos pendientes sin hacer full-table scans.
- Clave primaria e índices de búsqueda para `idempotency_key` en `automation_executions`.

## 3. PESO DEL BUNDLE DE PRODUCCIÓN
- El bundle cliente construido con Vite se mantiene optimizado (~266 kB gzipped) sin incorporar librerías pesadas de criptografía de servidor (node-forge, crypto nativo) en el frontend.
