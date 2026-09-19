# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 12. REGISTRO DE EJECUCIONES & ANTI-SPAM (`automation_executions`)

---

## 1. TRAZABILIDAD & AUDITORÍA
Cada intento de disparo de una automatización queda auditado de forma permanente en `automation_executions`:
- `id`: UUID.
- `rule_id`: Regla ejecutada.
- `event_type`: Evento asociado.
- `idempotency_key`: Clave única para evitar duplicaciones.
- `status`: `SUCCESS`, `FAILED`, `RETRYABLE`.
- `payload`: Snapshot de datos del evento.
- `result`: Respuesta devuelta por la acción.
- `error_message`: Detalle del fallo si ocurrió.
- `executed_at`: Timestamp de auditoría.

## 2. IDEMPOTENCIA ESTRICTA (ANTI-SPAM)
Para impedir que un cliente reciba múltiples mensajes de WhatsApp o que el personal reciba alertas duplicadas por reintentos o reconexiones de red:
```sql
CONSTRAINT uq_automation_execution_idempotency UNIQUE (organization_id, idempotency_key)
```
La clave determinista se construye con la fórmula:
`rule_{ruleId}_evt_{eventType}_ref_{referenceId}`.
Si ya existe un registro con esa clave en la base de datos, el evaluador descarta la ejecución inmediatamente.
