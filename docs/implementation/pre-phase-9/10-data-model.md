# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 10. MODELO DE DATOS PARA FASE 9 (ESPECIFICACIÓN)

*(Nota: Documento de diseño técnico. No se ejecuta ninguna migración).*

### 1. Nuevas Tablas / Vistas Requeridas
Para soportar la inteligencia de compras y la matriz Kasavana-Smith, se diseñan:

1. **`ingredient_suppliers` o extensión en `ingredients`**:
   - `supplier_id UUID REFERENCES suppliers(id)`
   - `package_factor NUMERIC(10, 2) DEFAULT 1.0` (unidades base por bulto/caja)
   - `min_stock_level NUMERIC(12, 4) DEFAULT 0.0`
   - `target_stock_level NUMERIC(12, 4) DEFAULT 0.0`
2. **`purchase_suggestions`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `organization_id UUID NOT NULL`
   - `branch_id UUID NOT NULL`
   - `warehouse_id UUID NOT NULL`
   - `ingredient_id UUID NOT NULL`
   - `supplier_id UUID REFERENCES suppliers(id)`
   - `current_stock NUMERIC(12, 4)`
   - `in_transit_stock NUMERIC(12, 4)`
   - `suggested_quantity NUMERIC(12, 4)`
   - `suggested_packages INTEGER`
   - `status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ORDERED', 'DISMISSED'))`
   - `created_at TIMESTAMPTZ DEFAULT clock_timestamp()`
3. **`menu_engineering_snapshots`**:
   - Clasificación periódica de platos: `product_id`, `period_month`, `sales_volume`, `contribution_margin`, `category_type ('STAR', 'PLOWHORSE', 'PUZZLE', 'DOG')`.
