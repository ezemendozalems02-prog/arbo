# ARBO OS — FASE 6: MODELO DE ÓRDENES PÚBLICAS & SNAPSHOTS
## ESQUEMA DE DATOS Y PERSISTENCIA DE `public_orders`

---

## 1. TABLA `public_orders`

Actúa como entidad de captación y buffer operativo para pedidos iniciados desde Internet:

```sql
CREATE TABLE IF NOT EXISTS public.public_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    order_number BIGINT NOT NULL,
    public_token TEXT NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PREPARATION', 'READY', 'COMPLETED', 'CANCELLED')),
    fulfillment_type VARCHAR(30) NOT NULL DEFAULT 'TAKEAWAY' CHECK (fulfillment_type IN ('TAKEAWAY', 'DINE_IN', 'DELIVERY')),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    delivery_address TEXT,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'PAY_ON_PICKUP' CHECK (payment_method IN ('CASH', 'CARD', 'ONLINE', 'PAY_ON_PICKUP')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    idempotency_key TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_public_orders_org_idempotency UNIQUE(organization_id, idempotency_key)
);
```

---

## 2. TABLA `public_order_items` & SNAPSHOTS INMUTABLES

Cada línea de pedido congela el snapshot del producto al momento exacto de la compra:

```sql
CREATE TABLE IF NOT EXISTS public.public_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_order_id UUID NOT NULL REFERENCES public.public_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name_snapshot VARCHAR(255) NOT NULL,
    unit_price_snapshot NUMERIC(12, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
    quantity NUMERIC(10, 3) NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
```

Si el restaurante cambia posteriormente el precio del café o edita el nombre del producto, los pedidos históricos mantienen sus snapshots intactos.
