# 27 — Arquitectura Futura: Plan de Migración a Supabase

Propuesta de arquitectura objetivo para transformar el prototipo cliente de ARBO OS en un sistema operativo gastronómico transaccional, multi-dispositivo y seguro sobre **Supabase (PostgreSQL + Auth + Realtime + RLS)**.

---

## 27.1 Esquema Relacional de Base de Datos (PostgreSQL)

```
tenants (id, name, slug, created_at)
└── branches (id, tenant_id, name, address, cuit, pto_vta_fiscal)
    ├── profiles (id REFERENCES auth.users, role: 'admin'|'cajero'|'mozo'|'cocina')
    ├── tables (id, branch_id, number, zone, capacity, status)
    ├── cash_registers (id, branch_id, name)
    │   └── cash_shifts (id, cash_register_id, opened_by, initial_cash, expected_cash, declared_cash, diff, status)
    │       └── cash_movements (id, shift_id, type, method, amount, concept, user_id)
    ├── orders (id, branch_id, table_id, status, subtotal, discount, total, created_by)
    │   ├── order_items (id, order_id, product_id, quantity, unit_price, sent_qty)
    │   └── tickets (id, order_id, station: 'cocina'|'bar', status: 'SENT'|'IN_PREP'|'READY'|'CANCELLED')
    ├── sales (id, branch_id, order_id, customer_id, fiscal_number, cae, subtotal, total)
    │   ├── sale_payments (id, sale_id, method, amount)
    │   └── sale_items (id, sale_id, product_id, quantity, unit_price, cost)
    ├── inventory_items (id, branch_id, code, name, category_id, unit, current_stock, min_stock, max_stock, avg_cost)
    │   └── stock_movements (id, item_id, type: 'entrada'|'venta'|'merma'|'ajuste', quantity, stock_before, stock_after, reference_id)
    ├── recipes (id, product_id, yield_qty, yield_unit)
    │   └── recipe_items (id, recipe_id, inventory_item_id, quantity, unit)
    └── customers (id, tenant_id, name, email, phone, points, tier_id)
        ├── loyalty_transactions (id, customer_id, type, amount, balance_before, balance_after)
        └── redemptions (id, customer_id, reward_id, code, status, used_at)
```

---

## 27.2 Triggers Automatizados en Base de Datos

1. **Trigger de Descuento de Stock por Venta:**
   Al insertar en `sales` → un trigger recorre los `sale_items`, busca la `recipe` asociada a cada `product_id`, multiplica los insumos consumidos y descuenta automáticamente `inventory_items.current_stock`, insertando los movimientos de auditoría tipo `venta`.
2. **Trigger de Puntos de Fidelización:**
   Al insertar una venta con `customer_id` → trigger calcula `floor(total / 100)`, emite la transacción `EARN` en `loyalty_transactions` y suma los puntos en `customers.points`.
3. **Trigger de Caja Automática:**
   Al registrar un pago en efectivo en `sale_payments` → trigger inyecta el movimiento en el turno activo (`cash_shifts`).

---

## 27.3 Supabase Realtime (Sincronización Multi-pantalla)

El problema de concurrencia actual (donde dos pestañas en `localStorage` se pisan silenciosamente) se resuelve suscribiendo los clientes vía WebSockets a canales de Postgres Changes:
- **KDS de Cocina:** Suscrito a `INSERT` y `UPDATE` en `tickets`. Un mozo envía comanda desde su tablet y la cocina la recibe en < 100 ms sin recargar.
- **Plano de Mesas:** Suscrito a `tables`. Si una mesa se cobra en caja, la tablet del mozo la muestra verde (`libre`) de inmediato.

---

## 27.4 Políticas de Seguridad por Fila (Row Level Security - RLS)

- `auth.jwt() -> tenant_id, branch_id, role`.
- Los cocineros solo pueden leer y actualizar `tickets` de su estación.
- Los mozos pueden abrir mesas, crear pedidos y enviar comandas, pero no pueden cerrar caja ni ver el Food Cost.
- Los cajeros tienen acceso a ventas, cobros y arqueos.
- Los datos de clientes y reportes de rentabilidad solo son visibles para usuarios con rol `admin`.
