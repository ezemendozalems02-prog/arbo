# 16 — Costos, Análisis, Métricas y Reportes

**Rutas:** `/admin`, `/admin/costos`, `/admin/analisis/clientes`, `/admin/analisis/retencion`, `/admin/analisis/cohortes`, `/admin/analisis/rfm`, `/admin/reportes/*`  
**Archivos:** `src/admin/pages/Dashboard.jsx`, `src/admin/pages/inventory/Costs.jsx`, `src/admin/pages/analytics/CustomerAnalytics.jsx`, `Retention.jsx`, `Cohorts.jsx`, `RFM.jsx`, `src/services/dashboardService.js`, `recipeCostService.js`, `inventoryCostService.js`, `customerAnalyticsService.js`  
**Estado general:** `PARTIAL` — módulo de costos y Food Cost teórico sólidamente conectado a recetas e insumos; Dashboard principal ciego a las ventas reales del POS (BUG-005); sección formal de Reportes no implementada (`available: false`).

---

## 16.1 Análisis de Costos y Food Cost (`/admin/costos`)

A diferencia del Dashboard principal, `Costs.jsx` sí conecta los contextos operativos:
- Lee `usePOS().sales` y calcula el consumo teórico con `calculateOrderCost` (`inventoryConsumptionService.js`).
- Cruza cada receta con su producto en carta (`calcRecipeSummary`) para calcular:
  - **Costo unitario de receta:** $\sum (\text{insumo.cantidad} \times \text{insumo.avgCost})$.
  - **Margen bruto:** $\text{precioVenta} - \text{costoReceta}$.
  - **Food Cost porcentual:** $(\text{costoReceta} / \text{precioVenta}) \times 100$.
- **Filtros temporales:** `Hoy`, `7 días`, `30 días`, `Mes actual`. Agrupa compras recibidas y mermas registradas en el período.
- **Veredicto:** `CONFIRMED_WORKING` (como cálculo teórico).

---

## 16.2 El Dashboard Principal y la Desconexión de Ventas (`/admin`)

- **FACT · BROKEN (BUG-005):** El tablero de mando principal (`Dashboard.jsx`) delega todos sus KPIs a `src/services/dashboardService.js`.
- Este servicio **no consume `POSContext`**: importa directamente `ORDERS` desde `src/mock/orders.js`.
- **Impacto:** Las ventas reales cobradas en caja o salón nunca aumentan los KPIs de *"Ventas de hoy"*, *"Pedidos"*, *"Ventas por hora"* ni *"Productos más vendidos"*. El panel permanece congelado en las cifras mock fijas ($585.300 / 36 pedidos).

---

## 16.3 Módulos de Analítica de Clientes (`/admin/analisis/*`)

| Módulo | Ruta | Lógica / Servicio | Estado |
|---|---|---|---|
| Clientes | `/admin/analisis/clientes` | Métricas agregadas de ticket promedio, frecuencia y distribución. | `CONFIRMED_WORKING` |
| Retención | `/admin/analisis/retencion` | Clientes nuevos, activos (≤30d), recurrentes (≥5 visitas) e inactivos (>60d). | `CONFIRMED_WORKING` |
| Cohortes | `/admin/analisis/cohortes` | Matriz de retención mensual (Abr-Sep 2026). Generada con PRNG `buildCohortDemo()`. | `UI_ONLY` (Demo explícito) |
| RFM | `/admin/analisis/rfm` | Desglose puro de Recencia (días), Frecuencia (visitas) y Valor Monetario ($). | `CONFIRMED_WORKING` |

---

## 16.4 Reportes Formales (`/admin/reportes/*`)

En `src/admin/nav.config.js:85-90`, todo el grupo de Reportes está declarado pero desactivado:
```js
{
  group: 'Reportes',
  items: [
    { path: '/admin/reportes/ventas', label: 'Ventas', available: false },
    { path: '/admin/reportes/productos', label: 'Productos', available: false },
    { path: '/admin/reportes/clientes', label: 'Clientes', available: false },
  ],
}
```
- **Veredicto:** `NOT_IMPLEMENTED`.
- Al hacer clic en cualquiera de estas rutas, el router renderiza `<ComingSoon/>`. No hay exportación a Excel/CSV, libro de IVA ventas, cierres contables ni reportes de mermas descargables.
