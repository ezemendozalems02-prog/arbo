# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 17. FRONTERAS ATÓMICAS (ACID) EN DESPACHO Y RECEPCIÓN

---

## 1. FRONTERA ACID DE DESPACHO (`DISPATCH`)
Dentro de una única transacción indivisible:
1. Se verifica que `stock_transfers.status == 'DRAFT' | 'REQUESTED'`.
2. Para cada ítem del remito, se verifica que `availableStock >= item.quantity_sent` en el depósito de origen.
3. Se inserta un `inventory_movement` de tipo `TRANSFER_OUT` con delta negativo (`-quantity_sent`) congelando el costo unitario snapshot.
4. Se actualiza `stock_transfers.status = 'DISPATCHED'`, `dispatched_at` y `dispatched_by`.
5. Si cualquiera de los pasos falla, se aborta y se produce rollback total. Jamás puede quedar el stock descontado con el remito en estado borrador.

---

## 2. FRONTERA ACID DE RECEPCIÓN (`RECEIVE`)
Dentro de una única transacción indivisible:
1. Se verifica y transiciona `stock_transfers.status` de `'DISPATCHED'` a `'RECEIVED'`.
2. Para cada ítem recibido, se inserta un `inventory_movement` de tipo `TRANSFER_IN` con delta positivo (`+quantity_received`) portando el costo snapshot transferido.
3. Se calcula el nuevo PPP ponderado para el depósito de destino.
4. Si se detectan mermas autorizadas (`quantity_sent > quantity_received`), se inserta un movimiento de tipo `WASTE`.
5. Si ocurre un fallo de base de datos, se revierte íntegramente la operación sin dejar movimientos huérfanos.
