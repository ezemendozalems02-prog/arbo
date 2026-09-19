# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 21. IMPACTO EN RENDIMIENTO (PERFORMANCE) & PLAN DE INDEXACIÓN

---

## 1. RIESGOS DE RENDIMIENTO CON MÚLTIPLES SUCURSALES
1. **Volumen de Movimientos**: Al sumarse transferencias frecuentes (`TRANSFER_OUT` y `TRANSFER_IN`), el volumen de filas en `inventory_movements` crecerá más rápido.
2. **Consultas de Consolidación Directiva**: Consultas que agregan métricas de todas las sucursales pueden sufrir si no se utilizan índices compuestos adecuados.

---

## 2. ESTRATEGIA DE INDEXACIÓN OBLIGATORIA
En la migración de Fase 8 se deberán planificar los siguientes índices relacionales:
- `idx_warehouses_org_branch ON warehouses(organization_id, branch_id, is_active)`
- `idx_transfers_org_status ON stock_transfers(organization_id, status, created_at DESC)`
- `idx_transfers_branches ON stock_transfers(origin_branch_id, destination_branch_id)`
- `idx_transfer_items_lookup ON stock_transfer_items(transfer_id, ingredient_id)`
- `idx_inv_movements_warehouse ON inventory_movements(organization_id, branch_id, warehouse_id, ingredient_id, created_at DESC)`

---

## 3. LÍMITE DE CONSULTAS EN PANEL DIRECTIVO
- El panel directivo consolidado utilizará agregaciones parametrizadas con límites de fecha claros (`created_at >= start_of_day`) para evitar scans completos de tablas históricas.
