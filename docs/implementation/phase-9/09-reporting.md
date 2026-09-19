# ARBO OS — FASE 9: REPORTES ANALÍTICOS REALES
## Estructura de Rutas y Servicios de Reporte

### 1. Activación de Rutas de Administración
Las pantallas de reportes inactivas han sido activadas con datos reales persistidos:
- `/admin/reportes/ventas`: Facturación, tickets, ticket promedio, desglose por medio de pago y comparativa temporal.
- `/admin/reportes/productos`: Matriz Kasavana-Smith interactiva y tabla de alertas de Food Cost Crítico.
- `/admin/reportes/clientes`: Métricas de fidelización, gasto medio y movimientos de puntos ARBO Club.
- `/admin/compras-sugeridas`: Gestión y visualización de recomendaciones operacionales de compras.

### 2. Separación entre UI y Consultas
Los componentes React no construyen queries complejas ad-hoc: consumen las funciones especializadas del motor `src/services/domain/analyticsEngine.js`:
- `getSalesReport()`
- `analyzeRecipeFoodCost()`
- `calculateKasavanaSmithMatrix()`
- `getInventoryReport()`
- `calculatePurchaseSuggestions()`
