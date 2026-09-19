# ARBO OS — FASE 10: MOTOR DE SINCRONIZACIÓN (SYNC ENGINE)
## Pipeline de Recuperación y Despacho

### 1. Ubicación y Algoritmo
Implementado en `src/services/domain/syncEngine.js`.

### 2. Ciclo de Vida del Despacho
1. **Detección Online:** Al restablecerse la conectividad (`window.addEventListener('online')`), el motor despierta automáticamente.
2. **Priorización Cronológica:** Se obtienen los ítems pendientes ordenados por `created_at` (FIFO) para garantizar consistencia en dependencias de negocio (ej. venta antes de cobro).
3. **Transición a PROCESSING:** La operación se marca como en procesamiento para evitar colisiones de envío concurrente.
4. **Validación Remota y ACK:**
   - Si el servidor responde con éxito: Se marca `SYNCED` y se graba `synced_at`.
   - Si el servidor reporta conflicto de stock: Se marca `FAILED` con motivo `SYNC_CONFLICT` y se alerta al operador.
   - Si ocurre error de red transitorio: Se incrementa `attempts` y se reintenta con backoff exponencial.
5. **Aislamiento de Errores:** El fallo de un ítem no bloquea la sincronización de ítems independientes no relacionados.
