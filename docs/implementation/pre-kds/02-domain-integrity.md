# ARBO OS — PRE-KDS TECHNICAL CHECKPOINT: INTEGRIDAD DEL DOMINIO

---

## 1. EVALUACIÓN DE LAS CADENAS DE RELACIÓN

Se verificaron las 3 cadenas relacionales fundamentales del sistema en PostgreSQL:

### Cadena 1: Jerarquía de Catálogo, Recetas e Inventario
$$\text{Organizations} \longrightarrow \text{Branches} \longrightarrow \text{Products} \longrightarrow \text{Recipes} \longrightarrow \text{Ingredients} \longrightarrow \text{Inventory Movements}$$
- **Verificación de Claves Foráneas:**
  - `products.organization_id` (CASCADE) y `products.category_id` (SET NULL).
  - `recipes.product_id` (CASCADE) con restricción de unicidad `UNIQUE(organization_id, product_id)`.
  - `recipe_items.recipe_id` (CASCADE) y `recipe_items.ingredient_id` (RESTRICT, impidiendo borrado accidental de insumos en uso).
  - `inventory_movements.ingredient_id` (RESTRICT), `organization_id` y `branch_id` (CASCADE).
- **Consistencia:** 100% coherente. No existen referencias circulares ni caminos que permitan asociar una receta a un producto de otra organización.

### Cadena 2: Jerarquía de Cajas y Turnos
$$\text{Organizations} \longrightarrow \text{Branches} \longrightarrow \text{Cash Registers} \longrightarrow \text{Cash Sessions} \longrightarrow \text{Cash Movements}$$
- **Verificación de Claves Foráneas:**
  - `cash_registers`: Atada a `organization_id` y `branch_id`.
  - `cash_sessions`: Atada a `cash_register_id`, con auditoría de `opened_by` y `closed_by`.
  - `cash_movements`: Atada a `cash_session_id`, con `reference_id` opcional para auditoría de ventas.
- **Consistencia:** El modelo en 3 niveles previene la sobrescritura de turnos anteriores.

### Cadena 3: Jerarquía de Ventas y Cobros
$$\text{Organizations} \longrightarrow \text{Branches} \longrightarrow \text{Sales} \longrightarrow \begin{cases} \text{Sale Items} \\ \text{Payments} \end{cases}$$
- **Verificación de Claves Foráneas:**
  - `sales.sale_number`: Secuencial atómico por sucursal con restricción `UNIQUE(organization_id, branch_id, sale_number)`.
  - `sale_items.product_id`: `RESTRICT` para preservar la integridad histórica si un producto es archivado o eliminado.
  - `payments.sale_id`: `CASCADE` para vincular estrictamente los cobros al ciclo de vida de la venta.

---

## 2. REVISIÓN DE SECUENCIA DE MIGRACIONES

1. `20260919000001_initial_tenancy_and_auth.sql`: Base de organizaciones, sucursales y perfiles.
2. `20260919000002_catalog_recipes_inventory.sql`: Catálogo, insumos y libro mayor de stock.
3. `20260919000003_sales_cash_acid.sql`: Cajas, ventas y procedimiento transaccional.

**Dictamen de Dependencias:** El orden DDL es estrictamente secuencial, sin referencias anticipadas a tablas no creadas, y con dependencias completamente resueltas.
