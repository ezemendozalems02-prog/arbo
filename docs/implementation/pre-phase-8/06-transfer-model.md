# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 06. MODELO DE TRANSFERENCIAS DE STOCK (`stock_transfers`)

---

## 1. ESQUEMA DE CABECERA (`stock_transfers`)
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `organization_id`: UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
- `transfer_number`: BIGINT NOT NULL (Correlativo interno por organización)
- `origin_branch_id`: UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT
- `origin_warehouse_id`: UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT
- `destination_branch_id`: UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT
- `destination_warehouse_id`: UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT
- `status`: VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REQUESTED', 'DISPATCHED', 'RECEIVED', 'CANCELLED'))
- `notes`: TEXT
- `requested_by`: UUID REFERENCES user_profiles(id)
- `dispatched_by`: UUID REFERENCES user_profiles(id)
- `received_by`: UUID REFERENCES user_profiles(id)
- `dispatched_at`: TIMESTAMPTZ
- `received_at`: TIMESTAMPTZ
- `created_at`, `updated_at`: TIMESTAMPTZ
- Restricción de unicidad: `UNIQUE(organization_id, transfer_number)`
- Restricción de no redundancia: `CHECK(origin_warehouse_id <> destination_warehouse_id)`

---

## 2. ESQUEMA DE ÍTEMS (`stock_transfer_items`)
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `transfer_id`: UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE
- `ingredient_id`: UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT
- `quantity_sent`: NUMERIC(12, 4) NOT NULL CHECK (quantity_sent > 0)
- `quantity_received`: NUMERIC(12, 4) CHECK (quantity_received >= 0)
- `unit`: VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'g', 'l', 'ml', 'u'))
- `unit_cost_snapshot`: NUMERIC(12, 4) NOT NULL CHECK (unit_cost_snapshot >= 0)
- Restricción: `UNIQUE(transfer_id, ingredient_id)`
