# ARBO OS — Fase 8: Catálogo Maestro Multi-Sucursal

### 1. Unicidad del Catálogo
Para evitar duplicación y dispersión de datos, los productos, modificadores, categorías e insumos pertenecen a nivel de la organización (`organizations`).
No se crean registros duplicados (`product_trevelin`, `product_esquel`, etc.).

### 2. Atributos Globales
- `id`
- `organization_id`
- `name`
- `category_id`
- `base_price` (precio de referencia corporativo)
- `recipe_id` (ficha técnica estándar unificada)
- `tax_rate` (alícuota fiscal homogénea)
