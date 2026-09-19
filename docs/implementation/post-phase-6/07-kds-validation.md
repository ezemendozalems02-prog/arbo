# ARBO OS — POST-PHASE 6 CHECKPOINT
## 07. VALIDACIÓN DE KDS & COMANDAS DE COCINA/BARRA

---

## 1. INTEGRACIÓN CON LA INFRAESTRUCTURA DE COCINA EXISTENTE

Se confirmó que la confirmación de pedidos públicos emite una comanda estándar en la tabla `kitchen_tickets` y sus líneas en `kitchen_ticket_items`:
- **Estación**: Dirigida a la estación operativa correspondiente (`BAR` / Cafetería).
- **Etiqueta Operativa**: Incluye en las notas el origen `[ONLINE TAKEAWAY]`.
- **Estado Inicial**: `NEW`.
- **Cero Comandas Duplicadas**: La orden pública no genera segundas comandas ni pantallas paralelas de despacho.

---

## 2. SINCRONIZACIÓN DE CICLO DE VIDA CON TRACKING

Se validó la transición de estados en cocina y su reflejo inmediato en el tracking del cliente:
- `NEW` $\rightarrow$ Web cliente: *Pedido Confirmado*
- `PREPARING` $\rightarrow$ Web cliente: *En Preparación*
- `READY` $\rightarrow$ Web cliente: *¡Listo para Retirar!*
- `ARCHIVED` $\rightarrow$ Web cliente: *Entregado / Completado*
- `CANCELLED` $\rightarrow$ Web cliente: *Pedido Cancelado*
