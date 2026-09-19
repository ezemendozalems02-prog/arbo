# ARBO OS — PRE-KDS TECHNICAL CHECKPOINT: KDS READINESS & DEPENDENCIAS

**Aclaración Fundamental:** Este documento analiza exclusivamente la preparación técnica y dependencias para la futura Fase 4 (KDS). **NO se ha implementado código de KDS en este checkpoint.**

---

## RESPUESTAS A LAS 12 PREGUNTAS CRÍTICAS DE KDS

### 1. ¿De dónde nace una comanda?
Nace de la acción del mozo o cajero al confirmar una orden de salón (`orders`) o al recibir un pedido de mostrador/takeaway. La comanda se genera cuando los platos/bebidas deben comenzar a elaborarse físicamente.

### 2. ¿Qué entidad representa la comanda?
En el esquema de Fase 4 se requerirá la entidad `kitchen_tickets` (cabecera de comanda) y `kitchen_ticket_items` (líneas de comanda con modificadores e instrucciones).

### 3. ¿Debe existir `kitchen_order` / `production_order`?
**SÍ**. Es indispensable separar la entidad financiera (`sales`, que representa el cobro y la fiscalidad) de la entidad operativa de producción (`kitchen_tickets`). Tienen ciclos de vida dispares: una comanda en salón se produce mucho antes de cobrarse, mientras que en mostrador puede cobrarse primero y producirse después.

### 4. ¿Cómo se vinculará con `sale`?
- En mostrador/takeaway: `kitchen_tickets.sale_id REFERENCES sales(id)` (la comanda nace con la venta ya pagada).
- En salón: `kitchen_tickets.order_id REFERENCES orders(id)`. Al momento del cobro final de la mesa, la venta (`sales`) referencia a la orden padre, vinculando retroactivamente las comandas producidas.

### 5. ¿Cómo se asignará `station`?
Cada producto o categoría tendrá una estación asignada (ej. `COCINA_CALIENTE`, `BARRA_BEBIDAS`, `CAFETERIA`, `POSTRES`). Al emitirse una comanda mixta, se puede generar un ticket por estación o filtrar dinámicamente en el frontend del KDS según la estación configurada en la pantalla.

### 6. ¿Cómo se manejarán los estados?
Ciclo de vida unificado y determinístico:
$$\text{QUEUED} \longrightarrow \text{PREPARING} \longrightarrow \text{READY} \longrightarrow \text{DELIVERED}$$
Con estado de salida excepcional: `CANCELLED`.

### 7. ¿Cómo se evitarán comandas huérfanas?
- Si una mesa o venta se cancela, una regla o trigger debe propagar el estado a las comandas asociadas (`status = 'CANCELLED'`).
- Las comandas canceladas no desaparecen: alertan visualmente a la estación de cocina para detener la preparación de inmediato.

### 8. ¿Qué ocurre si la venta se cancela?
- Si la venta aún no se preparó: se cancela la comanda y se revierte cualquier reserva de stock mediante un movimiento compensatorio.
- Si la comida ya fue elaborada: se marca la comanda como `WASTE` (desperdicio operativo) para justificar la salida de materia prima del stock sin cobro asociado.

### 9. ¿Qué ocurre si el pago falla?
- En mostrador: la comanda nunca se envía a cocina hasta que la transacción de pago se confirme exitosamente en PostgreSQL.
- En salón: si el pago falla al cerrar la mesa, la orden pasa a `PAYMENT_PENDING`, pero las comandas ya elaboradas permanecen registradas con sus tiempos de producción auditados.

### 10. ¿Qué información debe recibir el KDS?
- Número secuencial de ticket (ej. `#A-14`).
- Ubicación: Mesa o Mostrador/Llevar.
- Mozo o cajero solicitante.
- Nombre del plato y notas de preparación / modificadores.
- Cantidad.
- Timestamp de emisión y tiempo transcurrido (SLA timer con código de colores: verde, amarillo, rojo).
- Estado actual de preparación.

### 11. ¿Qué parte debe persistir en PostgreSQL?
**El 100% del estado histórico:** `kitchen_tickets`, `kitchen_ticket_items`, timestamps de cada cambio de estado (`created_at`, `started_at`, `ready_at`, `delivered_at`, `cancelled_at`). Esto es indispensable para métricas de rendimiento y tiempos de preparación.

### 12. ¿Qué parte puede ser realtime / UI state?
- El canal de notificación inmediata de tickets nuevos y actualizaciones de estado (Supabase Realtime CDC sobre `kitchen_tickets`).
- El cálculo de segundos transcurridos en pantalla (timer visual en el cliente).
- El feedback de audio (campana de ticket nuevo).
