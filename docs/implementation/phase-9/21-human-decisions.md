# ARBO OS — FASE 9: DECISIONES HUMANAS & DEFINICIONES
## Resoluciones Normativas de Producto y Arquitectura

### 1. Umbral Estricto de Food Cost Crítico
- **Regla fijada:** `food_cost_pct > 35.00%` es estrictamente `CRITICAL`.
- El valor `35.00%` exacto se clasifica como `WARNING` (preventivo).
- `35.01%` se clasifica como `CRITICAL`.

### 2. Factor de Empaque
- Al no contar previamente con el modelo de bulto de proveedor, se incorporó a `ingredients` la columna `package_factor` (NUMERIC > 0) y `packaging_unit`.
- El redondeo hacia arriba con `Math.ceil` garantiza que nunca se recomiende un abastecimiento deficitario.

### 3. Matriz Kasavana-Smith
- Los benchmarks de popularidad y rentabilidad se calculan con el promedio móvil de las ventas reales del período seleccionado (por defecto últimos 30 días).
- No se introducen ponderaciones opacas ni modelos generativos.
