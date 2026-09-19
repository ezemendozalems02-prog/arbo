# ARBO OS — Fase 8: Recetas y Alcance de Stock (Recipe Stock Scope)

### 1. Explosión de Recetas por Depósito
Cuando un producto vendido (ej. Espresso Doble o Pastelería) explota sus ingredientes técnicos según la receta configurada:
- La deducción de unidades base (`kg`, `l`, `u`) se calcula según el factor de rinde y merma estándar.
- La verificación de stock disponible evalúa la sumatoria de movimientos en el depósito correspondiente:
  ```javascript
  const ingMovements = inventoryMovements.filter(m =>
    m.ingredient_id === ingredientId &&
    (warehouseId ? m.warehouse_id === warehouseId : m.branch_id === branchId)
  )
  ```
- Si el depósito carece de stock físico suficiente, la venta completa se aborta bajo protocolo ACID antes de cualquier impacto en caja o KDS.
