# ARBO OS — Fase 8: Idempotencia en Despacho y Recepción

### 1. Reintentos de Red y Doble Click
- **Despacho Idempotente**: Si una petición `dispatchStockTransfer` se reintenta sobre un remito que ya pasó a `DISPATCHED`, el motor retorna `{ alreadyDispatched: true }` sin crear movimientos `TRANSFER_OUT` redundantes.
- **Recepción Idempotente**: Si una petición `receiveStockTransfer` se reintenta sobre un remito en `RECEIVED`, se rechaza cualquier creación adicional de movimientos en el ledger.
- Se garantiza que el número de movimientos `TRANSFER_OUT` y `TRANSFER_IN` por transferencia sea exactamente uno por ítem.
