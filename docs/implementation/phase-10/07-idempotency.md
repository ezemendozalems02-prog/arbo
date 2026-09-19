# ARBO OS — FASE 10: IDEMPOTENCIA OFFLINE
## Garantías Contra Duplicación de Transacciones

### 1. El Problema de la Red Inestable
En conexiones intermitentes, una petición puede llegar al servidor y ejecutarse, pero la respuesta (ACK) perderse en el camino. Ante la reconexión, el cliente reintenta enviar la misma transacción.

### 2. Clave de Idempotencia Canónica
Cada entrada encolada genera una `idempotency_key` determinista:
`idem_${operationType}_${refId}_${timestamp}`

### 3. Manejo en Backend y Base de Datos
- Las RPCs atómicas (ej. `process_sale_checkout_atomic`) verifican la clave de idempotencia en los ledgers correspondientes.
- Si la clave ya fue procesada, el backend devuelve el ID existente con código de éxito (`success: true, already_processed: true`).
- Esto garantiza que jamás se dupliquen:
  - Ventas (`sales`)
  - Movimientos de stock (`inventory_movements`)
  - Asientos de caja (`cash_movements`)
  - Puntos de fidelización (`loyalty_transactions`)
  - Comandas de cocina (`tickets`)
