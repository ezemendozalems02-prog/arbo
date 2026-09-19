# ARBO OS — Fase 8: Consolidación Ejecutiva Multi-Sucursal

### 1. Panel de Control Corporativo
El servicio `multiBranchManager.js` expone `getExecutiveConsolidatedMetrics`, agregando información financiera y física para la dirección ejecutiva sin duplicar datos:

- **Sucursales Activas**: Conteo e identificación de locaciones operativas.
- **Ventas Totales**: Suma corporativa y desglose por sucursal (`salesAmount`, `salesCount`).
- **Recaudación de Caja**: Ingresos monetarios netos consolidados.
- **Valuación de Activos de Inventario**: Stock físico valorizado según el PPP ponderado vigente.
- **Mercadería en Tránsito**: Conteo de transferencias en estado `DISPATCHED`.
- **Clientes y ARBO Club**: Miembros activos a nivel corporativo.
