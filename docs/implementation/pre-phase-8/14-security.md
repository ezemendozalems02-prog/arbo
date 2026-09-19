# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 14. ANÁLISIS DE SEGURIDAD & VECTOR DE AMENAZAS EN TRANSFERENCIAS

---

## 1. VECTORES DE AMENAZA IDENTIFICADOS

| Vector de Amenaza | Clasificación | Mitigación Planificada |
| :--- | :---: | :--- |
| **Transferencia entre Tenants Distintos (Cross-Tenant)** | **P0** | Validación estricta: `origin_warehouse.organization_id = destination_warehouse.organization_id = auth.jwt.org_id`. |
| **Depósitos Falsos o Foráneos** | **P0** | Constraints foráneas y validación de pertenencia al tenant en capa de servicio y RLS. |
| **Recepción Mayor a la Despachada (Phantom Stock)** | **P1** | Constraint: `quantity_received <= quantity_sent`. No se puede recibir más de lo que salió. |
| **Doble Recepción Concurrente (Double Credit)** | **P1** | Bloqueo transaccional de fila (`SELECT ... FOR UPDATE`) y condición `WHERE status = 'DISPATCHED'`. |
| **Cancelación Desautorizada de Despacho en Viaje** | **P1** | Solo usuarios con rol `ADMIN` u `OWNER` pueden revertir transferencias en estado `DISPATCHED`. |
| **Manipulación de Costo Snapshot** | **P1** | El costo snapshot se deriva en el backend del PPP vigente; la UI jamás envía el costo unitario. |

---

## 2. RECUENTO PREVENTIVO
- **P0**: 2 amenazas identificadas (Mitigaciones listas para implementación).
- **P1**: 4 amenazas identificadas (Reglas de validación definidas).
- **P2 / P3**: 0 bloqueantes.
