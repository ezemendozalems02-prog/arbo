-- ARBO OS — MIGRATION 20260919000009: OPERATIONAL INTELLIGENCE, ANALYTICS & PURCHASE SUGGESTIONS
-- Version: 1.8.0
-- Description: Establishes suppliers, packaging factors on ingredients, purchase suggestions,
-- and menu engineering / analytics snapshots with comprehensive Row Level Security (RLS) policies.

-- 1. TABLA: suppliers (PROVEEDORES COMERCIALES)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    cuit VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    payment_terms VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_suppliers_org_name UNIQUE (organization_id, name)
);

CREATE TRIGGER tr_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_suppliers_org ON public.suppliers(organization_id, is_active);

-- 2. EXTENDER ingredients CON FACTOR DE EMPAQUE Y PROVEEDOR PRINCIPAL
ALTER TABLE public.ingredients
ADD COLUMN IF NOT EXISTS primary_supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS packaging_unit VARCHAR(50) DEFAULT 'unidad',
ADD COLUMN IF NOT EXISTS package_factor NUMERIC(12, 4) DEFAULT 1.0000 CHECK (package_factor > 0),
ADD COLUMN IF NOT EXISTS target_stock_level NUMERIC(12, 4) DEFAULT 0.0000 CHECK (target_stock_level >= 0);

-- 3. TABLA: purchase_suggestions (SUGERENCIAS DETERMINÍSTICAS DE COMPRA)
CREATE TABLE IF NOT EXISTS public.purchase_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    current_stock NUMERIC(12, 4) NOT NULL,
    in_transit_stock NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    min_stock_alert NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    target_stock_level NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    net_deficit NUMERIC(12, 4) NOT NULL,
    package_factor NUMERIC(12, 4) NOT NULL DEFAULT 1.0000,
    suggested_packages INTEGER NOT NULL CHECK (suggested_packages >= 0),
    suggested_quantity NUMERIC(12, 4) NOT NULL CHECK (suggested_quantity >= 0),
    estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'SUGGESTED' CHECK (
        status IN ('SUGGESTED', 'ORDERED', 'DISMISSED')
    ),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TRIGGER tr_purchase_suggestions_updated_at
    BEFORE UPDATE ON public.purchase_suggestions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_purchase_sugg_lookup 
ON public.purchase_suggestions(organization_id, branch_id, status, created_at DESC);

-- 4. TABLA: menu_engineering_snapshots (MATRIZ KASAVANA-SMITH Y RENTABILIDAD)
CREATE TABLE IF NOT EXISTS public.menu_engineering_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    units_sold NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sales_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    food_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    food_cost_percentage NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    contribution_margin NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    popularity_rank VARCHAR(30) NOT NULL CHECK (popularity_rank IN ('HIGH', 'LOW')),
    profitability_rank VARCHAR(30) NOT NULL CHECK (profitability_rank IN ('HIGH', 'LOW')),
    kasavana_category VARCHAR(30) NOT NULL CHECK (
        kasavana_category IN ('STAR', 'PLOWHORSE', 'PUZZLE', 'DOG')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_menu_eng_org_period 
ON public.menu_engineering_snapshots(organization_id, branch_id, period_start, period_end);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_engineering_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies: suppliers
CREATE POLICY "suppliers_tenant_select" ON public.suppliers
    FOR SELECT USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "suppliers_tenant_insert" ON public.suppliers
    FOR INSERT WITH CHECK (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "suppliers_tenant_update" ON public.suppliers
    FOR UPDATE USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

-- Policies: purchase_suggestions
CREATE POLICY "purchase_suggestions_tenant_select" ON public.purchase_suggestions
    FOR SELECT USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "purchase_suggestions_tenant_insert" ON public.purchase_suggestions
    FOR INSERT WITH CHECK (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "purchase_suggestions_tenant_update" ON public.purchase_suggestions
    FOR UPDATE USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

-- Policies: menu_engineering_snapshots
CREATE POLICY "menu_engineering_tenant_select" ON public.menu_engineering_snapshots
    FOR SELECT USING (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );

CREATE POLICY "menu_engineering_tenant_insert" ON public.menu_engineering_snapshots
    FOR INSERT WITH CHECK (
        organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    );
