# ARBO OS — FASE 9: TRATAMIENTO DE STOCK EN TRÁNSITO
## Integración con Transferencias Multi-Depósito

### 1. El Problema del Stock en Tránsito
En operaciones gastronómicas multi-sucursal o multi-depósito (Fase 8), cuando la mercadería ha sido despachada (`DISPATCHED`) desde un depósito central pero aún no ha sido recibida (`RECEIVED`) en el depósito de destino, el stock ya no está físicamente disponible en origen pero se encuentra en camino al destino.

Si el algoritmo de compras sugeridas ignorara las transferencias despachadas, generaría sobrecompras innecesarias e inmovilización de capital.

### 2. Regla Determinística
- Se computan únicamente las transferencias con `status = 'DISPATCHED'`.
- El destino debe coincidir con el depósito evaluado (`destination_warehouse_id = warehouseId`) o sucursal evaluada.
- Las transferencias en estado `DRAFT` o `CANCELLED` no aportan stock en tránsito.
- Las transferencias en estado `RECEIVED` ya han impactado en `inventory_movements` (movimiento `TRANSFER_IN`), por lo que no se duplican.
- `stock_efectivo = stock_actual + stock_en_transito`.
- El déficit neto deduce con exactitud el stock en camino.
