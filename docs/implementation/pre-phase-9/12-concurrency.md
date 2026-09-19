# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 12. CONCURRENCIA E IDEMPOTENCIA

### 1. Escenarios de Riesgo
1. **Doble Generación de Sugerencias**:
   - Dos encargados abren el panel de compras al mismo tiempo.
   - Mitigación: Clave de unicidad por período y depósito `UNIQUE(warehouse_id, ingredient_id, status)` para evitar sugerencias duplicadas simultáneas.
2. **Conversión Duplicada a Compra Real**:
   - Doble click sobre "Crear Orden de Compra desde Sugerencias".
   - Mitigación: Actualización condicional `UPDATE purchase_suggestions SET status = 'ORDERED' WHERE id = :id AND status = 'PENDING'` con control de filas afectadas.
