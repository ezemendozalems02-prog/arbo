# ARBO OS — FASE 10: PERSISTENCIA EN INDEXEDDB OUTBOX
## Cola de Salida Transaccional

### 1. Ubicación y Estructura
Implementado en `src/services/domain/offlineOutbox.js`.

### 2. Esquema Canónico de Entrada
Cada registro de la outbox posee los siguientes campos obligatorios:
- `id`: Identificador único (prefijo `outbox_`).
- `operation_type`: Tipo de operación (`OFFLINE_SALE`, `CASH_MOVEMENT`, `KDS_TICKET`).
- `idempotency_key`: Clave criptográfica o determinista única.
- `payload`: Datos completos y serializados de la transacción.
- `organization_id`: Tenant al que pertenece la operación.
- `branch_id`: Sucursal de origen.
- `status`: Estado del ciclo de vida (`PENDING`, `PROCESSING`, `SYNCED`, `FAILED`, `DEAD_LETTER`).
- `attempts`: Número de intentos de transmisión realizados.
- `last_error`: Mensaje del último error registrado si falló.
- `created_at`: Marca de tiempo ISO de creación offline.
- `synced_at`: Marca de tiempo ISO de confirmación remota.

### 3. Estados de la Cola
- `PENDING`: Encolado en espera de reconexión.
- `PROCESSING`: En curso de envío al servidor.
- `SYNCED`: Confirmado por el servidor (ACK).
- `FAILED`: Fallo temporal; susceptible de reintento.
- `DEAD_LETTER`: Superó el límite de 5 intentos fallidos; requiere inspección técnica.
