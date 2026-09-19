# ARBO OS — Fase 8: Reportes Financieros y Prevención de Doble Conteo

### 1. Principios de Reportes
- **Transferencias Internas**: Los movimientos `TRANSFER_OUT` y `TRANSFER_IN` no representan ingresos ni ventas. No generan facturación fiscal, COGS de venta ni ingresos en efectivo.
- **Mermas de Transporte**: Los movimientos `WASTE` se imputan contablemente como costos operativos / pérdidas por logística, diferenciados de mermas de producción en barra o cocina.
- **Prevención de Duplicación**: Ninguna consulta analítica suma un movimiento de transferencia como nueva compra a proveedores.
