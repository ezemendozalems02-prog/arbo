# 22 — DISEÑO DE CONTRATOS DE API Y LÍMITES DE SERVICIO

---

## 1. ESTÁNDARES DE COMUNICACIÓN DE LA API

1. **Protocolo:** RESTful sobre HTTPS / JSON con payloads tipados en TypeScript.
2. **Convención de Nomenclatura:** Endpoints en plural y minúsculas (`/api/v1/orders`, `/api/v1/inventory`).
3. **Manejo de Errores:** Estándar RFC 7807 (*Problem Details for HTTP APIs*):
   ```json
   {
     "type": "https://api.arbo.app/errors/insufficient-stock",
     "title": "Stock insuficiente para receta",
     "status": 409,
     "detail": "El ingrediente Queso Mozzarella no cuenta con existencias suficientes en Barra.",
     "instance": "/api/v1/orders/ord_123/settle"
   }
   ```
4. **Encabezados Requeridos:**
   - `Authorization: Bearer <JWT>` (Excepto endpoints públicos).
   - `Idempotency-Key: <UUID>` (Obligatorio en comandos de cobro y mutaciones críticas).
   - `X-Branch-Id: <UUID>` (Contexto operativo de sucursal activa).

---

## 2. CATÁLOGO DE CONTRATOS POR DOMINIO

### 2.1. Dominio: Órdenes y Ventas (`/api/v1/orders`)
- **Commands:**
  - `POST /api/v1/orders`: Crea un borrador de orden en mostrador o mesa.
    - *Permisos:* `WAITER`, `CASHIER`, `MANAGER`, `ADMIN`.
    - *Input:* `{ table_session_id?, order_type, items: [{ product_id, variant_id?, quantity, notes, modifiers[] }] }`
    - *Output:* `{ order_id, status: 'PENDING', subtotal, final_total }`
  - `POST /api/v1/orders/{id}/settle`: Liquida y cobra la orden de forma atómica.
    - *Permisos:* `CASHIER`, `MANAGER`, `ADMIN`.
    - *Header:* `Idempotency-Key`
    - *Input:* `{ payments: [{ method, amount, tip? }], customer_id?, reward_redemption_id? }`
    - *Output:* `{ order_id, status: 'SETTLED', settled_at, points_earned }`
    - *Eventos Emitidos:* `order.settled`, `loyalty.points_accrued`, `inventory.depleted`.
- **Queries:**
  - `GET /api/v1/orders?branch_id=...&status=PENDING`: Lista comandas activas de la sucursal.

---

### 2.2. Dominio: Control de Caja (`/api/v1/cash`)
- **Commands:**
  - `POST /api/v1/cash/shifts/open`: Abre el turno del cajero.
    - *Permisos:* `CASHIER`, `MANAGER`, `ADMIN`.
    - *Input:* `{ register_id, opening_balance }`
    - *Output:* `{ shift_id, status: 'OPEN', opened_at }`
  - `POST /api/v1/cash/shifts/{id}/close`: Ejecuta el arqueo ciego y cierra el turno.
    - *Permisos:* `CASHIER`, `MANAGER`, `ADMIN`.
    - *Input:* `{ counts: { cash_declared, cards_declared, mp_declared } }`
    - *Output:* `{ shift_id, status: 'CLOSED', discrepancy, closed_at }`
  - `POST /api/v1/cash/movements`: Asienta ingreso o egreso manual.
    - *Permisos:* `CASHIER`, `MANAGER`, `ADMIN`.
    - *Input:* `{ type: 'MANUAL_INCOME'|'MANUAL_EXPENSE', amount, reason }`

---

### 2.3. Dominio: Cocina y KDS (`/api/v1/kds`)
- **Commands:**
  - `PATCH /api/v1/kds/items/{order_item_id}/status`: Actualiza estado de preparación.
    - *Permisos:* `KITCHEN`, `MANAGER`, `ADMIN`.
    - *Input:* `{ status: 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED' }`
    - *Eventos Emitidos:* `kds.item_status_changed`.
- **Queries:**
  - `GET /api/v1/kds/tickets?branch_id=...&station=...`: Obtiene tickets en preparación.

---

### 2.4. Dominio: Inventario y Fichas Técnicas (`/api/v1/inventory`)
- **Commands:**
  - `POST /api/v1/inventory/adjustments`: Asienta merma o ajuste físico auditado.
    - *Permisos:* `MANAGER`, `ADMIN`, `OWNER`.
    - *Input:* `{ warehouse_id, ingredient_id, quantity_delta, reason }`
  - `POST /api/v1/purchases/invoices`: Registra factura de compra recalculando PPP.
    - *Permisos:* `MANAGER`, `ADMIN`, `OWNER`.
    - *Input:* `{ supplier_id, invoice_number, items: [{ ingredient_id, package_quantity, package_unit, conversion_factor, total_cost }] }`
- **Queries:**
  - `GET /api/v1/inventory/stock?warehouse_id=...`: Retorna existencias consolidadas.
  - `GET /api/v1/recipes/{id}/cost`: Retorna el Food Cost % dinámico y margen actual.

---

### 2.5. Dominio: Comercio Público (`/api/v1/public`)
- **Endpoints Públicos (Sin JWT, con Rate-Limiting):**
  - `GET /api/v1/public/{slug}/menu`: Retorna catálogo activo optimizado para comensal.
  - `POST /api/v1/public/{slug}/orders`: Inicia orden de delivery/takeaway con checkout MercadoPago.
  - `POST /api/v1/public/{slug}/reservations`: Solicita reserva en el salón.
  - `POST /api/v1/public/webhooks/mercadopago`: Recepción oficial de notificaciones de pago.
