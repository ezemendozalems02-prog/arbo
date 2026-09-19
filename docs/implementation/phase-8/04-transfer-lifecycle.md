# ARBO OS — Fase 8: Ciclo de Vida de Transferencias & Máquina de Estados

### 1. Diagrama de Transiciones
```
[ DRAFT ]  --(dispatch)-->  [ DISPATCHED ]  --(receive)-->  [ RECEIVED ]
    |                              |
 (cancel)                       (cancel)
    v                              v
[ CANCELLED ]               [ CANCELLED (con compensación) ]
```

### 2. Reglas de Transición
1. `DRAFT -> DISPATCHED`:
   - Valida stock disponible en depósito de origen.
   - Congela el snapshot de costo unitario (`unit_cost_snapshot`).
   - Inserta movimiento indivisible `TRANSFER_OUT` en `inventory_movements`.
   - Registra actor y timestamp de despacho.
2. `DISPATCHED -> RECEIVED`:
   - Bloquea la fila con locking condicional para impedir doble recepción concurrente.
   - Compara cantidades físicas recibidas vs despachadas.
   - Inserta movimiento indivisible `TRANSFER_IN` en destino con costo snapshot.
   - Si hubo faltante, inserta movimiento `WASTE` con motivo "Merma en transporte".
   - Recalcula el PPP ponderado del destino.
   - Registra actor y timestamp de recepción.
3. `DISPATCHED -> CANCELLED`:
   - Emite automáticamente un movimiento compensatorio `TRANSFER_IN` en el depósito de origen para reintegrar la mercadería despachada.
4. Estados terminales:
   - `RECEIVED` y `CANCELLED` son estados finales inmutables. Se rechaza cualquier transición posterior.
