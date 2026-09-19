-- ARBO OS — MIGRATION 20260919000008: MULTI-BRANCH SCALE, WAREHOUSES & STOCK TRANSFERS
-- Version: 1.7.0
-- Description: Establishes warehouses, extends inventory movements with warehouse scope,
-- creates stock transfers and transfer items, branch product availability overrides,
-- triggers, indexes, and comprehensive Row Level Security (RLS) policies.

-- 1. TABLA: warehouses (DEPÓSITOS FÍSICOS Y LOCALES)
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    warehouse_type VARCHAR(30) NOT NULL DEFAULT 'BRANCH' CHECK (
        warehouse_type IN ('CENTRAL', 'BRANCH', 'BAR', 'KITCHEN')
    ),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_warehouses_branch_code UNIQUE (branch_id, code)
);

CREATE TRIGGER tr_warehouses_updated_at
    BEFORE UPDATE ON public.warehouses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_warehouses_org_branch ON public.warehouses(organization_id, branch_id, is_active);

-- 2. EXTENDER inventory_movements CON SCOPE DE DEPÓSITO (RETROCOMPATIBLE)
ALTER TABLE public.inventory_movements
ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inv_movements_warehouse 
ON public.inventory_movements(organization_id, branch_id, warehouse_id, ingredient_id, created_at DESC);

-- 3. TABLA: stock_transfers (REMITOS Y FLUJO TRANSACCIONAL DE TRANSFERENCIAS)
CREATE TABLE IF NOT EXISTS public.stock_transfers (
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

CREATE TRIGGER tr_stock_transfers_updated_at
    BEFORE UPDATE ON public.stock_transfers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_stock_transfers_org_status ON public.stock_transfers(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_origin ON public.stock_transfers(origin_branch_id, origin_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_destination ON public.stock_transfers(destination_branch_id, destination_warehouse_id);

-- 4. TABLA: stock_transfer_items (DETALLE DE INSUMOS TRANSFERIDOS)
CREATE TABLE IF NOT EXISTS public.stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES public.stock_transfers(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    quantity_sent NUMERIC(12, 4) NOT NULL CHECK (quantity_sent > 0),
    quantity_received NUMERIC(12, 4) CHECK (quantity_received >= 0),
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'g', 'l', 'ml', 'u')),
    unit_cost_snapshot NUMERIC(12, 4) NOT NULL DEFAULT 0.0000 CHECK (unit_cost_snapshot >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_stock_transfer_items_ingredient UNIQUE (transfer_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_transfer_items_transfer ON public.stock_transfer_items(transfer_id);

-- 5. TABLA: branch_product_settings (SOBREESCRITURAS DE DISPONIBILIDAD Y PRECIO LOCAL)
CREATE TABLE IF NOT EXISTS public.branch_product_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    price_override NUMERIC(12, 2) CHECK (price_override IS NULL OR price_override >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_branch_product_settings UNIQUE (branch_id, product_id)
);

CREATE TRIGGER tr_branch_product_settings_updated_at
    BEFORE UPDATE ON public.branch_product_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_branch_product_lookup ON public.branch_product_settings(branch_id, product_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_product_settings ENABLE ROW LEVEL SECURITY;

-- Policies: warehouses
CREATE POLICY "warehouses_tenant_select" ON public.warehouses
    FOR SELECT USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "warehouses_tenant_insert" ON public.warehouses
    FOR INSERT WITH CHECK (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "warehouses_tenant_update" ON public.warehouses
    FOR UPDATE USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

-- Policies: stock_transfers
CREATE POLICY "stock_transfers_tenant_select" ON public.stock_transfers
    FOR SELECT USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "stock_transfers_tenant_insert" ON public.stock_transfers
    FOR INSERT WITH CHECK (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "stock_transfers_tenant_update" ON public.stock_transfers
    FOR UPDATE USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

-- Policies: stock_transfer_items (derivado de la transferencia matriz)
CREATE POLICY "transfer_items_tenant_select" ON public.stock_transfer_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stock_transfers st
            WHERE st.id = stock_transfer_items.transfer_id
              AND st.organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
        )
    );

CREATE POLICY "transfer_items_tenant_insert" ON public.stock_transfer_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stock_transfers st
            WHERE st.id = stock_transfer_items.transfer_id
              AND st.organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
        )
    );

-- Policies: branch_product_settings
CREATE POLICY "branch_product_settings_tenant_all" ON public.branch_product_settings
    FOR ALL USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );
