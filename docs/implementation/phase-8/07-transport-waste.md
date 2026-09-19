# ARBO OS — Fase 8: Merma en Transporte & Discrepancias

### 1. Resolución de Discrepancias Físicas
Durante la auditoría del Pre-Phase 8 Checkpoint se estableció como decisión obligatoria:
"Faltantes en recepción física se imputan automáticamente como WASTE con motivo 'Merma en transporte'."

### 2. Mecanismo Operativo
1. El remito registra `quantity_sent` (despachada) y `quantity_received` (recibida físicamente en destino).
2. Si $Q_{recibida} < Q_{enviada}$:
   - Se crea el movimiento `TRANSFER_IN` en destino por la cantidad física exacta ($Q_{recibida}$).
   - Se genera un movimiento de merma de inventario:
     - `movement_type`: `WASTE`
     - `quantity_delta`: $-(Q_{enviada} - Q_{recibida})$
     - `unit_cost_snapshot`: Costo snapshot de despacho
     - `reference_id`: ID de la transferencia
     - `reason`: "Merma en transporte remito #{transfer_number}"
3. El movimiento de origen `TRANSFER_OUT` no se modifica, preservando la verdad histórica del despacho.
