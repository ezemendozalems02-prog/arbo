# ARBO OS — Fase 8: Sales Warehouse Scope

### 1. Integración con Checkout ACID
En `executeSaleCheckoutAtomic`, las ventas se enlazan explícitamente a un depósito específico mediante el parámetro `warehouseId`.
Si una sucursal tiene múltiples depósitos (ej. Barra y Cocina), la venta consume existencias únicamente del depósito asignado.

### 2. Aislamiento Estricto
- Se verifica que `warehouse.branch_id === branchId` y `warehouse.organization_id === organizationId`.
- Si se intenta consumir un depósito perteneciente a otra sucursal, la transacción se aborta con el error `WAREHOUSE_NOT_FOUND`.
- Los movimientos `SALE_DEPLETION` en `inventory_movements` registran `warehouse_id: warehouseId`.
