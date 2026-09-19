# ARBO OS — FASE 6: INTEGRACIÓN CON KDS & ESTACIONES
## EMISIÓN DE COMANDAS SIN SISTEMAS PARALELOS

---

## 1. FUENTE ÚNICA DE VERDAD EN COCINA

En ARBO OS no existen comandas paralelas para pedidos online. Las comandas generadas por `public_orders` se integran directamente en la tabla `kitchen_tickets` desarrollada en la Fase 4:

- **Estación Asignada**: El ticket se dirige a la estación correspondiente al producto (ej. `BAR` para cafetería, `COCINA` para tostados).
- **Etiqueta Visual Operativa**: Se añade el prefijo `[ONLINE TAKEAWAY]` en las notas de la comanda:
  ```
  [ONLINE TAKEAWAY] Pedido #1 - Cliente: Cliente Demo Online
  ```
- **Realtime / Polling**: La pantalla de KDS en la cocina recibe el nuevo ticket de forma inmediata mediante Supabase Realtime o mediante el fallback de deduplicación.

---

## 2. SINCRONIZACIÓN DE ESTADO HACIA EL CLIENTE

A medida que el personal de cocina avanza el ticket en el KDS, la vista pública de tracking (`getPublicOrderTracking`) refleja el estado en tiempo real:

| Estado KDS | Estado Tracking Cliente | Mensaje al Usuario |
| :--- | :--- | :--- |
| `NEW` | `CONFIRMED` | *Pedido recibido y confirmado* |
| `PREPARING` | `IN_PREPARATION` | *Baristas preparando tu pedido* |
| `READY` | `READY` | *¡Tu pedido está listo para retirar en mostrador!* |
| `ARCHIVED` | `COMPLETED` | *Pedido entregado. ¡Gracias!* |
| `CANCELLED` | `CANCELLED` | *Pedido cancelado* |
