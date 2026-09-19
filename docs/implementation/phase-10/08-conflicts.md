# ARBO OS — FASE 10: RESOLUCIÓN DE CONFLICTOS
## Reconciliación de Stock y Concurrencia

### 1. El Problema del Stock Desfasado
Durante el corte de red, el dispositivo offline opera sobre un snapshot local donde un insumo tenía 10 unidades. Si otro canal (ej. e-commerce online o POS de otra estación) consumió 6 unidades en el servidor, el stock real disponible es 4.

### 2. Regla de Reconciliación
La función `reconcileOfflineStockSale()` implementa la lógica determinística:
- **Caso A (Stock Suficiente):** Si el servidor cuenta con $\ge 4$ unidades y la venta offline requiere 4, la venta se aplica y el stock remanente se actualiza en el ledger centralizado a 0.
- **Caso B (Sobreventa / Conflicto):** Si la venta offline requiere 5 unidades pero el servidor solo dispone de 4:
  - **PROHIBIDO:** Sobreescritura silenciosa o forzado de inventario negativo sin registro.
  - **ACCIÓN:** Se emite estado `SYNC_CONFLICT` con detalle `INSUFFICIENT_SERVER_STOCK`.
  - La venta se marca para conciliación operativa y ajuste manual del supervisor en caja.
