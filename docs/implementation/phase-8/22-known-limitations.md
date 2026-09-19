# ARBO OS — Fase 8: Limitaciones Conocidas & Decisiones de Diseño

### 1. Decisiones Estructurales
- **Depósito Central como Sucursal**: El Almacén Central / Tostaduría fue modelado como una sucursal con depósitos propios para mantener la integridad relacional de `inventory_movements.branch_id NOT NULL`.
- **Precios Corporativos por Defecto**: La política de precios mantiene el precio corporativo base a menos que se defina un `price_override` en `branch_product_settings`.

### 2. Alcance Excluido (Non-Scope)
- No incluye ERP generalista ni logística internacional.
- No incluye gestión de flotas ni GPS de transportistas.
- No incluye asignación por lote y fecha de vencimiento (FIFO/FEFO) estricta a nivel bulto físico (queda reservado para optimizaciones operativas posteriores).
