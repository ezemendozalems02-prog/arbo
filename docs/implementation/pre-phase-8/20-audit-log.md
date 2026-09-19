# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 20. TRAZABILIDAD & REGISTRO DE AUDITORÍA EN FASE 8

---

## 1. OPERACIONES SENSIBLES A AUDITAR
En una operación multi-local distribuida, las transferencias y ajustes de stock mueven mercadería física de alto valor:
- Creación de remito de transferencia (`CREATE_TRANSFER`).
- Despacho de mercadería (`DISPATCH_TRANSFER`).
- Recepción física y firma (`RECEIVE_TRANSFER`).
- Cancelación o devolución de remito (`CANCEL_TRANSFER`).
- Ajustes de inventario manuales o por inventario físico ciego (`INVENTORY_ADJUSTMENT`).

---

## 2. INTEGRACIÓN CON LA TABLA `audit_logs`
El sistema existente cuenta con `audit_logs` (Fase 1) y triggers automáticos:
- Cada operación de transferencia y movimiento registrará en `audit_logs`:
  - `organization_id`
  - `user_id` (quién ejecutó la acción)
  - `action`: ej. `stock_transfer.dispatched`, `stock_transfer.received`
  - `entity_type`: `'stock_transfers'`
  - `entity_id`: UUID de la transferencia
  - `old_data` y `new_data`: Snapshot JSON con las cantidades enviadas y recibidas.
