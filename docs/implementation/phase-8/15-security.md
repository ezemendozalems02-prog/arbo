# ARBO OS — Fase 8: Seguridad & Aislamiento

### 1. Vectores de Ataque Mitigados
- **Cross-Tenant Warehouses**: Creación o consulta de depósitos con `organization_id` ajeno rechazada en DB (RLS) y en backend.
- **Cross-Branch Hijacking**: Personal asignado a Esquel no puede despachar ni recibir en depósitos de Trevelin.
- **Price / Quantity Tampering**: Las cantidades y los precios base se resuelven exclusivamente en backend/RPC, ignorando cualquier manipulación en payloads del cliente web.
- **Transición de Estado No Autorizada**: Verificación de máquina de estados estricta en el servidor.
