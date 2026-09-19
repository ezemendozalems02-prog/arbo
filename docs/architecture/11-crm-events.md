# 11 — EVENT-DRIVEN CRM Y ARQUITECTURA DE EVENTOS

---

## 1. TAXONOMÍA DE EVENTOS DEL SISTEMA

Para evitar el acoplamiento caótico entre módulos, ARBO OS clasifica sus eventos en tres categorías formales:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TAXONOMÍA DE EVENTOS                            │
├───────────────────────────────┬────────────────────────────────────────┤
│ 1. DOMAIN EVENTS              │ Ocurren dentro del mismo Bounded       │
│    (In-Process / Sincrónico)  │ Context para actualizar agregados.     │
├───────────────────────────────┼────────────────────────────────────────┤
│ 2. INTEGRATION EVENTS         │ Comunican contextos distintos de forma │
│    (Cross-Context / Asíncrono)│ asíncrona a través de una cola fiable. │
├───────────────────────────────┼────────────────────────────────────────┤
│ 3. ANALYTICS EVENTS           │ Telemetría de métricas y auditoría     │
│    (Telemetría / No Bloqueante│ que alimentan dashboards y reportes.   │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 2. CATÁLOGO MAESTRO DE EVENTOS DE INTEGRACIÓN

| Nombre del Evento | Contexto Emisor | Consumidores Principales | Payload Esencial |
| :--- | :--- | :--- | :--- |
| `order.settled` | Sales Context | ARBO Club, Stock, Fiscal, CRM | `order_id`, `customer_id`, `amount`, `items[]` |
| `order.cancelled` | Sales Context | KDS, Stock Depletion, Caja | `order_id`, `reason`, `refund_amount` |
| `reservation.created` | Public Context | Floor Plan (Mesas), Notificaciones | `reservation_id`, `diners`, `date_time`, `customer` |
| `loyalty.points_accrued` | Loyalty Context | CRM, Notificaciones WhatsApp | `customer_id`, `points_delta`, `new_balance` |
| `loyalty.reward_redeemed`| Loyalty Context | POS Checkout, CRM | `customer_id`, `reward_id`, `points_spent` |
| `inventory.stock_low` | Inventory Context | Compras Sugeridas, Alertas | `ingredient_id`, `current_stock`, `min_threshold`|
| `cash.shift_closed` | Cash Context | Reportes Contables, Auditoría | `shift_id`, `discrepancy`, `cashier_id` |

---

## 3. GARANTÍA DE ENTREGA: THE TRANSACTIONAL OUTBOX PATTERN

> **"Un error común es intentar guardar una orden en base de datos y en la misma línea de código enviar un mensaje a una cola externa (Redis/RabbitMQ). Si la red falla en ese instante, la orden se cobra pero el cliente nunca recibe sus puntos ni el stock se actualiza."**

Para garantizar que ningún evento se pierda, ARBO OS implementa el **Transactional Outbox Pattern**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TRANSACTIONAL OUTBOX WORKFLOW                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. TRANSACCIÓN ATÓMICA:                                                │
│    - INSERT INTO orders ...                                            │
│    - INSERT INTO outbox_events (event_name, payload, status: 'PENDING')│
│    - COMMIT EN POSTGRESQL                                              │
├────────────────────────────────────────────────────────────────────────┤
│ 2. MESSAGE RELAY PROCESSOR (Worker en background cada 500ms):          │
│    - SELECT * FROM outbox_events WHERE status = 'PENDING' FOR UPDATE   │
│    - Publica evento en Event Bus (Redis / Webhook / Service)           │
│    - UPDATE outbox_events SET status = 'PUBLISHED'                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. ESTRUCTURA ESTÁNDAR DEL EVENTO (CLOUDEVENTS JSON)

```json
{
  "specversion": "1.0",
  "id": "evt_4f8a3d12-8e6b-4f9a-9e12-3b7c8d9e0f1a",
  "source": "https://api.arbo.app/sales",
  "type": "order.settled",
  "time": "2026-09-19T14:32:00.123Z",
  "datacontenttype": "application/json",
  "data": {
    "organization_id": "org_a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "branch_id": "br_11223344-5566-7788-99aa-bbccddeeff00",
    "order_id": "ord_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "customer_id": "cust_8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
    "final_total": 14500.00,
    "points_earned": 145,
    "settled_at": "2026-09-19T14:32:00Z"
  }
}
```
