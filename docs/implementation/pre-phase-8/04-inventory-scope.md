# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 04. ALCANCE DE INVENTARIO ACTUAL Y AISLAMIENTO DE SALDOS

---

## 1. ESTADO ACTUAL DE `inventory_movements`
En la migración `20260919000002_catalog_recipes_inventory.sql`:
- La tabla `inventory_movements` ya incluye:
  - `organization_id UUID NOT NULL`
  - `branch_id UUID NOT NULL`
  - `ingredient_id UUID NOT NULL`
  - `movement_type VARCHAR(50)` con soporte para:
    `INITIAL_STOCK`, `PURCHASE`, `ADJUSTMENT`, `SALE_DEPLETION`, `WASTE`, `TRANSFER_IN`, `TRANSFER_OUT`.
  - `quantity_delta NUMERIC(12, 4) NOT NULL`
  - `unit_cost_snapshot NUMERIC(12, 4) NOT NULL`

---

## 2. AISLAMIENTO ACTUAL DE SALDOS
Se auditó la función de cálculo `aggregateStockFromMovements` y la función SQL `get_current_stock`:
- El cálculo de stock físico **YA ESTÁ FILTRADO POR `branch_id`**.
- **Resultado de Auditoría**:
  El sistema **YA PERMITE** que el insumo "Café de Especialidad" tenga saldos independientes:
  - Trevelin = 5.000 kg
  - Esquel = 2.000 kg
  - Depósito Central = 50.000 kg
  Sin mezclar saldos entre sucursales ni organizaciones.

---

## 3. EVOLUCIÓN NECESARIA PARA FASE 8
Para permitir la granularidad interna de depósitos (ej. transferir café del depósito general de Trevelin a la Barra de Trevelin):
- `inventory_movements` incorporará de forma opcional / retrocompatible:
  `warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL`.
- Todas las consultas existentes basadas en `branch_id` continuarán funcionando al 100% sin degradación.
