# ARBO OS — Fase 8: Remitos y Transferencias de Stock

### 1. Modelo de Datos
Las transferencias operativas se gestionan mediante `stock_transfers` y sus líneas detalladas en `stock_transfer_items`:

```sql
CREATE TABLE public.stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    transfer_number BIGINT NOT NULL CHECK (transfer_number > 0),
    origin_branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    origin_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    destination_branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    destination_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (
        status IN ('DRAFT', 'REQUESTED', 'DISPATCHED', 'RECEIVED', 'CANCELLED')
    ),
    notes TEXT,
    requested_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    dispatched_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    received_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    dispatched_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_stock_transfers_org_number UNIQUE (organization_id, transfer_number),
    CONSTRAINT chk_transfers_diff_warehouses CHECK (origin_warehouse_id <> destination_warehouse_id)
);
```

### 2. Validaciones Críticas
- `origin_warehouse_id <> destination_warehouse_id`: Impedido a nivel base de datos y de backend.
- `transfer_number`: Secuencia correlativa inmutable por organización.
- `stock_transfer_items`: Congela `quantity_sent`, `quantity_received`, `unit` y `unit_cost_snapshot`.
