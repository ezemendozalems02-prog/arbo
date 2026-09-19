# ARBO OS — POST-PHASE 7 CHECKPOINT
## 07. AUDITORÍA DEL MOTOR DE AUTOMATIZACIONES (`automationEngine`)

---

## 1. EVALUADOR DE REGLAS & IDEMPOTENCIA
Se auditó `src/services/domain/automationEngine.js`:
- Las reglas en `automation_rules` son filtradas por tenant (`organization_id`), estado activo (`is_enabled: true`) y tipo de evento.
- **Clave de Idempotencia Anti-Spam**: Se genera determinísticamente mediante `buildIdempotencyKey({ ruleId, eventType, referenceId })`.
- Ante disparos repetidos del mismo evento con idéntica referencia, el evaluador detecta la ejecución preexistente y omite el procesamiento con status `SKIPPED_DUPLICATE`.

## 2. AISLAMIENTO DE FALLOS (FAILURE ISOLATION)
Se verificó explícitamente mediante pruebas automatizadas (Test 28):
- Si una acción colateral (ej. gateway de WhatsApp o webhook) falla y lanza una excepción, el error es capturado dentro de `dispatchDomainEvent`.
- El incidente queda registrado en `automation_executions` con `status: 'FAILED'` y su respectivo `error_message`.
- **Garantía Crítica**: El error de la automatización **NUNCA** produce rollback ni interrumpe la transacción comercial principal de venta.
