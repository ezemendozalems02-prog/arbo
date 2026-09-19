# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 15. ESTRATEGIA DE RENDIMIENTO Y ESCALABILIDAD

### 1. Desafíos de Rendimiento
Las pantallas de reportes y análisis pueden involucrar agregación de miles de líneas históricas de venta e inventario:
- **Índices Cubrientes**: Índices sobre `sales(organization_id, branch_id, created_at, status)` y `sale_items(sale_id, product_id, subtotal)`.
- **Límites Temporales**: Los reportes por defecto consultan ventanas acotadas (Hoy, Últimos 7 días, Mes actual) con paginación explícita para períodos más extensos.
- **Caché en Memoria / Memoización**: Métricas de rotación de carta y matriz Kasavana-Smith calculadas bajo demanda o cacheadas por franja horaria.
