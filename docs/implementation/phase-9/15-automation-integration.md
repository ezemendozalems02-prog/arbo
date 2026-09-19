# ARBO OS — FASE 9: INTEGRACIÓN CON AUTOMATIZACIONES
## Event Pipeline e Idempotencia Operativa

### 1. Reutilización del Motor de Automatizaciones de Fase 7
La Fase 9 no crea un motor de reglas paralelo ni fragmentado. Integra sus eventos directamente en el pipeline unificado de `src/services/domain/automationEngine.js`:
- Evento `FOOD_COST_CRITICAL`: Disparado cuando un producto supera el 35.00% de Food Cost.
- Evento `LOW_STOCK`: Disparado cuando el stock efectivo desciende por debajo del nivel mínimo.
- Evento `PURCHASE_SUGGESTION`: Notificación o registro de abastecimiento sugerido.

### 2. Idempotencia y Aislamiento de Fallos
- **Idempotencia:** Se genera una clave `buildIdempotencyKey({ ruleId, eventType, referenceId })` para evitar alertas o ejecuciones duplicadas en la misma ventana de tiempo.
- **Aislamiento de Fallos:** Si la ejecución de una regla de automatización falla, jamás interrumpe la consulta analítica ni la transacción operativa.
