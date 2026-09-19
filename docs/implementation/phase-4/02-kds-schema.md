# ARBO OS — FASE 4: ESQUEMA DE BASE DE DATOS KDS

**Migración:** `supabase/migrations/20260919000004_kds_stations_tickets.sql`

---

## 1. TABLAS IMPLEMENTADAS

### 1.1 `kitchen_stations`
Estaciones físicas de despacho o preparación en una sucursal:
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `organization_id` UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
- `branch_id` UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE
- `name` VARCHAR(100) NOT NULL
- `code` VARCHAR(50) NOT NULL (ej. `'BAR'`, `'KITCHEN'`)
- `is_active` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at` TIMESTAMPTZ DEFAULT clock_timestamp()
- `updated_at` TIMESTAMPTZ DEFAULT clock_timestamp()
- **Constraint:** `UNIQUE (branch_id, code)`

### 1.2 `kitchen_tickets`
Cabecera de comanda operativa:
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `organization_id` UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
- `branch_id` UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE
- `sale_id` UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE
- `station_id` UUID NOT NULL REFERENCES kitchen_stations(id) ON DELETE RESTRICT
- `ticket_number` BIGINT NOT NULL
- `status` VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'PREPARING', 'READY', 'ARCHIVED', 'CANCELLED'))
- `notes` TEXT
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
- `started_at` TIMESTAMPTZ
- `ready_at` TIMESTAMPTZ
- `archived_at` TIMESTAMPTZ
- `cancelled_at` TIMESTAMPTZ
- `created_by` UUID REFERENCES user_profiles(id) ON DELETE SET NULL
- `cancelled_by` UUID REFERENCES user_profiles(id) ON DELETE SET NULL
- `cancel_reason` TEXT
- **Constraint:** `UNIQUE (branch_id, ticket_number)`

### 1.3 `kitchen_ticket_items`
Líneas operativas de la comanda con snapshots:
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `ticket_id` UUID NOT NULL REFERENCES kitchen_tickets(id) ON DELETE CASCADE
- `product_id` UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT
- `product_name_snapshot` VARCHAR(255) NOT NULL
- `quantity` NUMERIC(12, 4) NOT NULL CHECK (quantity > 0)
- `notes` TEXT
- `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'ARCHIVED', 'CANCELLED'))
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()

---

## 2. ÍNDICES Y SEGURIDAD

- `idx_kitchen_stations_branch ON kitchen_stations(branch_id, is_active)`
- `idx_kitchen_tickets_active ON kitchen_tickets(branch_id, station_id, status, created_at)`
- `idx_kitchen_tickets_sale ON kitchen_tickets(sale_id)`
- `idx_kitchen_ticket_items_ticket ON kitchen_ticket_items(ticket_id)`
- RLS habilitado en las 3 entidades con validación por `organization_id`.
