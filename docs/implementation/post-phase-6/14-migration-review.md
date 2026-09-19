# ARBO OS — POST-PHASE 6 CHECKPOINT
## 14. REVISIÓN DE MIGRACIONES DDL VERSIONADAS

---

## 1. HISTORIAL DE MIGRACIONES VERIFICADAS

Se revisó la coherencia secuencial de las 6 migraciones aplicadas en `supabase/migrations/`:

1. `20260919000001_initial_tenancy_and_auth.sql`:
   - `organizations`, `branches`, `user_profiles`, `organization_users`, función `get_user_org_ids()`, RLS base.
2. `20260919000002_catalog_recipes_inventory.sql`:
   - `categories`, `products`, `ingredients`, `recipes`, `recipe_items`, `inventory_movements`.
3. `20260919000003_sales_cash_acid.sql`:
   - `cash_registers`, `cash_sessions`, `cash_movements`, `sales`, `sale_items`, `payments`, RPC `execute_sale_checkout`.
4. `20260919000004_kds_stations_tickets.sql`:
   - `kitchen_stations`, `kitchen_tickets`, `kitchen_ticket_items`, integración de comanda en `execute_sale_checkout`.
5. `20260919000005_arbo_club_crm.sql`:
   - `customers`, `rewards`, `reward_redemptions`, `loyalty_transactions`, regla $\lfloor \text{total}/100 \rfloor$, índice de idempotencia `uq_loyalty_tx_sale_earn`.
6. `20260919000006_public_commerce.sql`:
   - `public_orders`, `public_order_items`, `branches.slug`, `products.is_available`, RPC `get_public_catalog`, RLS para comercio público.

---

## 2. INTEGRIDAD ESTRUCTURAL

- **Foreign Keys**: Todas las claves foráneas tienen políticas `ON DELETE CASCADE` o `RESTRICT` adecuadas que impiden borrados accidentales de registros con ventas asociadas.
- **Constraints & Tipos**: Verificados los tipos de datos numéricos con precisión monetaria (`NUMERIC(12,2)`) y de inventario (`NUMERIC(12,4)`), evitando errores de redondeo de punto flotante.
- **No hay scripts sueltos**: El esquema es 100% reproducible en cualquier entorno Supabase desde cero.
