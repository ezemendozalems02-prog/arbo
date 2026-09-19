# ARBO OS — Fase 8: Concurrencia y Bloqueo Transaccional

### 1. Control de Doble Recepción
Cuando múltiples operarios o procesos intentan recibir la misma transferencia de forma simultánea:
- Se evalúa la condición atómica:
  `UPDATE stock_transfers SET status = 'RECEIVED' WHERE id = :id AND status = 'DISPATCHED'`
- Solo el primer proceso adquiere el derecho de registrar `TRANSFER_IN`.
- El segundo proceso detecta que el estado ya no es `DISPATCHED` y es rechazado con `TRANSFER_ALREADY_RECEIVED`.
- Esto previene la duplicación de stock físico en destino.
