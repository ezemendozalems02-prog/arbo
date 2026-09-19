# ARBO OS — FASE 9: MOTOR DE COMPRAS SUGERIDAS
## Algoritmo de Abastecimiento Determinístico

### 1. Definición y Regla Fundamental
Una compra sugerida **NO es una orden de compra real**. Es una recomendación operacional con estado `SUGGESTED`.
No se generan órdenes de compra automáticamente sin revisión y confirmación explícita del usuario responsable.

### 2. Fórmula del Algoritmo
Para cada insumo activo de la organización:
1. `stock_actual = SUM(quantity_delta)` a partir de `inventory_movements`.
2. `stock_en_transito = SUM(items)` de transferencias entre depósitos con estado `DISPATCHED` y destino en el depósito/sucursal evaluado.
3. `stock_efectivo = stock_actual + stock_en_transito`.
4. `deficit_neto = target_stock_level - stock_efectivo`.
5. Si `deficit_neto <= 0`, no se genera sugerencia.
6. Si `deficit_neto > 0`:
   - `bultos_sugeridos = CEIL(deficit_neto / factor_empaque)`
   - `cantidad_sugerida = bultos_sugeridos * factor_empaque`
   - `costo_estimado = cantidad_sugerida * costo_unitario`
