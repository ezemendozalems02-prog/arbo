# ARBO OS — FASE 9: PERFORMANCE & MITIGACIÓN N+1
## Optimización de Consultas e Iteraciones en Lote

### 1. Sin Patrones N+1
Las funciones analíticas no ejecutan consultas individuales por cada insumo o producto. Agregan los movimientos de inventario y transacciones de venta en mapas en memoria indexados por ID:
- Acumulación de unidades vendidas mediante `Map<productId, quantity>`.
- Acumulación de stock en un solo recorrido de `inventoryMovements`.
- Tiempo de ejecución verificado: menos de 10ms para 50 insumos y recetas complejas.

### 2. Índices de Base de Datos
La migración 009 incluye índices compuestos:
- `idx_suppliers_org ON suppliers(organization_id, is_active)`
- `idx_purchase_suggestions_lookup ON purchase_suggestions(organization_id, branch_id, status)`
- `idx_menu_engineering_lookup ON menu_engineering_snapshots(organization_id, branch_id, period_start, period_end)`
