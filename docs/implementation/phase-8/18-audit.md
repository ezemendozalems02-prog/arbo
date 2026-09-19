# ARBO OS — Fase 8: Registro de Auditoría (Audit Log)

### 1. Eventos Sensibles Auditados
Toda mutación en el ciclo de transferencias y depósitos se audita de forma inmutable:
- `CREATE_TRANSFER`
- `DISPATCH_TRANSFER`
- `RECEIVE_TRANSFER`
- `CANCEL_TRANSFER`
- Mermas de transporte asociadas

### 2. Estructura del Registro
- `organization_id`: Tenant correspondiente.
- `entity`: `stock_transfers`.
- `entity_id`: ID del remito.
- `action`: Acción ejecutada.
- `actor_id`: UUID del operador responsable.
- `created_at`: Marca temporal ISO 8601 del servidor.
