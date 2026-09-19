# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 22. ESTRATEGIA DE PRUEBAS AUTOMATIZADAS PARA FASE 8

---

## 1. SUITE DE VALIDACIÓN PLANIFICADA (`validate_phase8_multibranch_transfers.js`)
Se planifican las siguientes categorías de prueba para certificar Fase 8:

### A. Depósitos y Aislamiento (Tests 1–4)
1. Creación de depósitos asociados a sucursales (`branch_id NOT NULL`).
2. Aislamiento estricto de depósitos entre sucursales de la misma organización.
3. Aislamiento multi-tenant (Org A no puede ver depósitos de Org B).
4. Depósito predeterminado asignado correctamente por sucursal.

### B. Ciclo de Vida de Transferencias (Tests 5–10)
5. Creación de remito en estado `DRAFT`.
6. Despacho exitoso: inserción atómica de `TRANSFER_OUT` en origen y transición a `DISPATCHED`.
7. Recepción exitosa: inserción atómica de `TRANSFER_IN` en destino y transición a `RECEIVED`.
8. Prevención de despacho ante stock insuficiente en origen.
9. Cancelación de remito en `DRAFT` sin movimientos de stock.
10. Cancelación y compensación de remito en `DISPATCHED` (retorno a origen).

### C. Costeo PPP y Mermas en Tránsito (Tests 11–14)
11. Traspaso exacto de costo unitario snapshot desde origen.
12. Recálculo ponderado exacto del PPP en la sucursal receptora.
13. Registro de merma en tránsito si cantidad recibida < cantidad enviada.
14. Bloqueo si se intenta recibir una cantidad superior a la enviada.

### D. Concurrencia e Idempotencia (Tests 15–17)
15. Prevención de doble recepción concurrente sobre el mismo remito.
16. Idempotencia en reintentos de confirmación.
17. Bloqueo de transferencias entre depósitos idénticos (`origin == destination`).

### E. Integración con Ventas, Catálogo y Regresiones (Tests 18–25)
18. Venta en Salón Trevelin descuenta exclusivamente del depósito de Trevelin.
19. Venta en Salón Esquel descuenta exclusivamente del depósito de Esquel.
20. Catálogo maestro compartido con disponibilidad diferenciada por sucursal.
21. Consolidación directiva agrega correctamente ventas y Food Cost de ambas sucursales.
22. Regresiones completas de Fases 1 a 7 (236 pruebas existentes intactas).
