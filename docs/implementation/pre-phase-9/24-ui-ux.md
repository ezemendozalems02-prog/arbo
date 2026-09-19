# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 24. ESTRATEGIA DE UI / UX PARA FASE 9

### 1. Vistas a Activar
En `src/admin/nav.config.js`:
- `/admin/reportes/ventas` (`available: true`)
- `/admin/reportes/productos` (`available: true`)
- `/admin/reportes/clientes` (`available: true`)
- `/admin/compras/sugerencias` o panel integrado en `/admin/compras` para visualización y aprobación de compras sugeridas.
- Indicador visual en `/admin/recetas` y `/admin/costos` para platos con `FOOD_COST_CRITICAL`.

### 2. Estética y Ergonomía
- Mantener la identidad visual de ARBO OS (`COLORS`, `FONTS`, paleta cálida patagónica).
- Gráficos claros (barras de dispersión de margen, tarjetas KPI con tendencia porcentual).
- Cero interfaces mock: toda acción de compra sugerida o filtro consulta datos reales.
