# ARBO OS — Fase 8: Overview
## Escala Multi-Sucursal, Depósitos & Consolidación Ejecutiva

### 1. Resumen Ejecutivo
La Fase 8 dota a ARBO OS de capacidades para operar múltiples locaciones geográficas (Trevelin, Esquel, y el Almacén Central / Tostaduría) preservando la integridad estricta del ledger contable de inventario (`inventory_movements`), el aislamiento multi-tenant y la seguridad transaccional ACID.

### 2. Principios de Diseño
1. **Única Fuente de Verdad para Stock**: `inventory_movements` es y sigue siendo la única fuente de verdad contable y física. Las tablas `stock_transfers` y `stock_transfer_items` representan remitos y el ciclo operativo documental, pero jamás saldos paralelos.
2. **Modelo Central / Tostaduría**: La Tostaduría Central y Centro de Distribución se modela como una sucursal operativa propia (`branches.id NOT NULL`), garantizando que ninguna política de RLS ni clave foránea se degrade con valores nulos.
3. **Inmutabilidad y Snapshots**: Todo despacho congela el costo unitario (`unit_cost_snapshot`) en base al PPP promedio ponderado del depósito de origen al momento exacto de la salida.
4. **Recálculo de PPP en Destino**: El ingreso a destino (`TRANSFER_IN`) recalcula el PPP local combinando el saldo preexistente con la cantidad física recibida y el costo snapshot congelado.
5. **Mermas en Tránsito**: Si la cantidad recibida es inferior a la despachada, la discrepancia se imputa automáticamente en el ledger como `WASTE` con motivo "Merma en transporte", auditado e inmutable.
6. **Catálogo Maestro con Overrides Locales**: Los productos y recetas pertenecen a la organización matriz. Las sucursales configuran disponibilidad local (`is_available`) y precios regionales opcionales (`price_override`) sin duplicar entidades.

### 3. Componentes Implementados
- Migración `20260919000008_multibranch_warehouses_transfers.sql`
- Servicio de Dominio `warehouseManager.js`
- Servicio de Dominio `stockTransferManager.js`
- Servicio de Dominio `multiBranchManager.js`
- Extensiones en `saleCheckout.js` para validación y consumo por depósito (`warehouseId`)
- UI Administrativa `/admin/depositos` (`Warehouses.jsx`) y `/admin/transferencias` (`StockTransfers.jsx`)
- Suite de Pruebas `validate_phase8_multibranch_transfers.js` (30/30 passed)
- Regresión completa de Fases 1 a 7 (236/236 passed, 266/266 total).
