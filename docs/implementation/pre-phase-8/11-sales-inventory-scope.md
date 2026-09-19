# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 11. EVOLUCIÓN DE `executeSaleCheckoutAtomic` EN FASE 8

---

## 1. COMPORTAMIENTO ACTUAL
Actualmente, `executeSaleCheckoutAtomic`:
```javascript
// Filtra movimientos por ingrediente y sucursal
const ingMovements = inventoryMovements.filter(
  m => m.ingredient_id === ingredientId && m.branch_id === branchId
)
const availableStock = aggregateStockFromMovements(ingMovements, ingredientId)
```
Y crea los movimientos asignando `branch_id = branchId`.

---

## 2. EVOLUCIÓN EN FASE 8 (SIN ROMPER ATOMICIDAD)
Para incorporar depósitos sin alterar la interfaz de llamadas del POS ni de las órdenes públicas:
1. `executeSaleCheckoutAtomic` aceptará un parámetro opcional `warehouseId`.
2. Si `warehouseId` no es provisto, el servicio resuelve automáticamente el depósito predeterminado de la sucursal:
   ```javascript
   const activeWarehouse = warehouses.find(w => w.branch_id === branchId && w.is_default) || defaultWarehouse
   ```
3. La verificación de stock disponible evaluará los movimientos acotados a `branch_id` y `warehouse_id`.
4. El registro generado en `inventory_movements` incluirá tanto `branch_id` como `warehouse_id`.
5. **Garantía**: Toda la transacción continúa siendo 100% indivisible y atómica dentro del bloque de checkout.
