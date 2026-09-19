# ARBO OS — PRE-ARBO CLUB CHECKPOINT: CLASIFICACIÓN DE DEUDA TÉCNICA Y RIESGOS

---

## 1. CLASIFICACIÓN DE HALLAZGOS Y RIESGOS

| Nivel | Hallazgo / Riesgo | Severidad | Mitigación Planificada para Fase 5 |
| :--- | :--- | :---: | :--- |
| **P0 (Bloquea Fase 5)** | *Ninguno detectado.* | — | Las bases de datos relacionales, el motor ACID y el ciclo de ventas están 100% operativos y probados. |
| **P1 (Riesgo Importante)** | **Incorporación de `customer_id` en `sales`:** Actualmente la tabla `sales` no posee clave foránea a `customers` en PostgreSQL (solo existía en el mock de frontend). | Medio | En la migración de Fase 5 se agregará formalmente: `ALTER TABLE public.sales ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;`. |
| **P2 (Mejora Posterior)** | **Optimización de Queries RFM en Bases Grandes:** Calcular RFM en tiempo real sobre millones de filas puede ser costoso. | Bajo | En Fase 5, implementar vistas materializadas o campos agregados auditados en `customers` para recencia y total gastado. |
| **INFO** | **Reglas de Vencimiento de Puntos:** Los puntos actualmente no vencen en el MVP. | Nulo | Preparar en el ledger el campo `expires_at` para soporte futuro sin romper compatibilidad. |
