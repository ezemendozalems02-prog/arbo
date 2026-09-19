# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 07. INTEGRACIÓN CON KDS & ESTACIONES OPERATIVAS

---

## 1. REGLA FUNDAMENTAL: UN ÚNICO MOTOR DE COMANDAS KDS

En ARBO OS **no existirá un KDS separado o pantalla paralela para pedidos online**.
La cocina, la barra y la pastelería deben operar con una **única fuente de verdad operacional**: la infraestructura desarrollada y validada en la Fase 4 (`kitchen_tickets` y `kitchen_ticket_items`).

---

## 2. FLUJO DE COMANDA DESDE LA WEB PÚBLICA

1. Cuando la orden pública es confirmada y se genera la venta real, `execute_sale_checkout(...)` emite automáticamente el ticket KDS correspondiente a la estación operativa configurada (`BAR`, `COCINA`, etc.).
2. El ticket se crea con las notas del cliente y una etiqueta de origen:
   - Ejemplo: `notes = "[ONLINE TAKEAWAY] Cliente: Thiago (Retira 18:30)"`.
3. Las pantallas de cocina reciben la comanda en tiempo real mediante los canales de Supabase Realtime ya existentes y probados en Fase 4.
4. Si la conexión de cocina tiene intermitencia, el mecanismo de **Fallback por Polling y Deduplicación** recupera el ticket sin duplicados.

---

## 3. SINCRONIZACIÓN DEL ESTADO DE PEDIDO HACIA EL CLIENTE WEB

El avance en cocina actualiza el tracking del cliente web de forma natural:
- Cocina pulsa ticket $\rightarrow$ `PREPARING` $\rightarrow$ Web cliente muestra: *"Tu pedido se está preparando"*.
- Cocina finaliza ticket $\rightarrow$ `READY` $\rightarrow$ Web cliente muestra: *"¡Tu pedido está listo para retirar!"*.
- Entrega en mostrador $\rightarrow$ `ARCHIVED` $\rightarrow$ Web cliente muestra: *"Pedido completado. ¡Gracias por elegir ARBO!"*.

Esto se logra leyendo directamente el `status` del ticket KDS sin requerir tablas intermedias de sincronización.
