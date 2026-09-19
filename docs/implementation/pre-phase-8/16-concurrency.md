# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 16. CONTROL DE CONCURRENCIA & RECEPCIÓN SIMULTÁNEA

---

## 1. ESCENARIO DE CARRERA: RECEPCIÓN SIMULTÁNEA
Si dos encargados de depósito abren el mismo remito en terminales distintas y presionan simultáneamente "Confirmar Recepción":
- **Riesgo Crítico**: Que el sistema procese dos veces el ingreso, duplicando artificialmente el stock recibido (+10kg +10kg = +20kg).

---

## 2. MECANISMO DE PROTECCIÓN DETERMINISTA
1. **Transición Condicional Atómica**:
   ```sql
   UPDATE public.stock_transfers
   SET status = 'RECEIVED', received_at = clock_timestamp(), received_by = p_user_id
   WHERE id = p_transfer_id AND status = 'DISPATCHED';
   ```
2. **Evaluación de Afectación de Filas**:
   - Si `ROW_COUNT = 1`: La primera petición ganó la carrera; procede a insertar los `inventory_movements` correspondientes.
   - Si `ROW_COUNT = 0`: La segunda petición encuentra que el remito ya no está en `DISPATCHED`. Lanza excepción controlada `TRANSFER_ALREADY_RECEIVED` o retorna un NO-OP idempotente sin generar movimientos duplicados.
