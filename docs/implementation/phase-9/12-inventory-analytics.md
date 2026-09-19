# ARBO OS — FASE 9: ANALÍTICA DE INVENTARIO & ACTIVOS
## Métricas de Stock, Valorización y Mermas

### 1. Valorización del Inventario
- El stock de cada insumo se deriva exclusivamente del libro mayor `inventory_movements`: `stock = aggregateStockFromMovements(movements, ingredientId)`.
- La valorización se calcula con el costo medio ponderado unitario (PPP) vigente: `valor_insumo = stock * current_cost_unit`.
- `valor_total_inventario = SUM(valor_insumo)`.

### 2. Detección de Bajo Stock
- Se compara el stock actual contra `target_stock_level` (o `min_stock`).
- Si `stock <= min_stock`, el insumo se clasifica como `STOCK_BAJO` o en necesidad de reposición.

### 3. Integración con Mermas y Transferencias
- Cuantificación en moneda local de mermas operativas (`wasteMovements`).
- Seguimiento de transferencias entre depósitos en estado `DISPATCHED` (mercadería en tránsito).
