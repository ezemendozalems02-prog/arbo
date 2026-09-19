# ARBO OS — Fase 8: Cobertura de Pruebas Automatizadas

### 1. Escenarios de Prueba Fase 8 (30/30)
1. `warehouse creation`: Depósito Central creado con código único y tipo CENTRAL.
2. `warehouse tenant isolation`: Creación cruzada de depósitos entre tenants bloqueada.
3. `warehouse branch isolation`: Filtro por sucursal retorna solo sus depósitos.
4. `transfer creation`: Remito creado en DRAFT con correlativo secuencial.
5. `invalid destination`: Depósito destino inexistente rechazado.
6. `origin == destination`: Origen idéntico a destino rechazado en DB y código.
7. `insufficient stock`: Despacho abortado con rollback si stock disponible < requerido.
8. `dispatch`: Transición a DISPATCHED con registro de actor y timestamp.
9. `transfer out ledger`: Stock de origen descontado atómicamente en `inventory_movements`.
10. `receive`: Transición a RECEIVED confirmada.
11. `transfer in ledger`: Stock de destino incrementado con cantidad física recibida.
12. `PPP destination`: Recálculo de costo promedio ponderado usando snapshot de despacho.
13. `transport waste`: Diferencia de faltante imputada automáticamente como WASTE.
14. `duplicate receive`: Doble recepción sobre remito recibido bloqueada.
15. `concurrent receive`: Locking transaccional previene colisiones concurrentes.
16. `cancellation`: Cancelación de tránsito emite movimiento compensatorio íntegro.
17. `cross-tenant transfer`: Transferencias entre organizaciones bloqueadas.
18. `cross-branch authorization`: Operador de otra sucursal no puede autorizar remito.
19. `inactive warehouse`: Depósitos inactivos no pueden originar ni recibir transferencias.
20. `idempotent dispatch`: Reintento de despacho no duplica egresos.
21. `idempotent receive`: Exactamente 1 movimiento de ingreso persiste.
22. `recipe warehouse scope`: Venta descuenta insumos estrictamente del depósito de la sucursal.
23. `sale warehouse scope isolation`: Venta rechazada si intenta consumir depósito ajeno.
24. `master catalog`: Unicidad del producto en catálogo organizacional sin duplicación.
25. `branch availability`: Overrides de disponibilidad y precio por sucursal validados.
26. `consolidated reporting`: Agregación ejecutiva corporativa sin doble conteo.
27. `audit logs`: Despacho, recepción y cancelación registrados en auditoría.
28. `RLS`: Políticas de seguridad RLS verificadas en migración SQL.
29. `regression`: Las 236 pruebas de Fases 1 a 7 ejecutadas y aprobadas al 100%.
30. `production build`: `npx vite build` compila limpiamente sin errores.
