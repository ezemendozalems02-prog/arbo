# ARBO OS — FASE 10: PUNTO DE VENTA OFFLINE (OFFLINE POS)
## Operatoria Continua en Mostrador

### 1. Snapshot Local del Catálogo
El POS mantiene en almacenamiento local el catálogo maestro de productos, variantes y recetas activas.

### 2. Creación de Ventas Locales
El cajero puede:
- Seleccionar productos y mesas.
- Calcular totales, descuentos y medios de pago.
- Registrar la venta localmente con estado provisional.
- Imprimir comanda de preparación inmediatamente en la impresora térmica física local.
- La transacción se encola en la outbox de IndexedDB con su desglose completo de ítems.
