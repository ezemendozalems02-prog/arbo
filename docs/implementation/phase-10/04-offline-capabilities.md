# ARBO OS — FASE 10: CAPACIDADES OFFLINE
## Matriz Operativa: Offline-Capable vs Online-Required

### 1. Operaciones Habilitadas en Modo Offline (OFFLINE-CAPABLE)
- **POS / Mostrador:** Carga de productos desde snapshot local, cálculo de subtotales e impuestos, aplicación de recetas base.
- **Cobro en Efectivo:** Registro de pago cash y generación de movimiento de caja local.
- **Comandas de Cocina:** Creación de comanda con estado local `PENDING_SYNC` y despacho de comanda a impresora térmica de cocina.
- **Cola de Salida (Outbox):** Encolado persistente con clave de idempotencia única.

### 2. Operaciones que Exigen Conectividad (ONLINE-REQUIRED)
- **Fiscalización AFIP Directa:** La obtención de CAE en tiempo real requiere validación en servidores de AFIP. En offline, la venta se registra comercialmente y la factura pasa a la cola de contingencia de Fase 7.
- **Transferencias entre Sucursales:** El despacho físico o recepción remota requiere validación en el ledger centralizado.
- **Reportes Analíticos Pesados:** Reportes ejecutivos que consolidan múltiples depósitos.
- **Gestión de Usuarios y Roles:** Creación o modificación de credenciales de seguridad.
