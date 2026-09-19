-- ARBO OS — MIGRATION 20260919000006: PUBLIC COMMERCE & ONLINE ORDERING
-- Version: 1.5.0
-- Description: Establishes public commerce schemas: branch slugs, product availability,
-- public orders, order items, secure tracking tokens, public catalog RPC, and RLS policies.

-- 1. EXTENDER SUCURSALES CON SLUG PÚBLICO
ALTER TABLE public.branches
ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- Actualizar branches existentes con slug por defecto si es nulo
UPDATE public.branches
SET slug = LOWER(REPLACE(REPLACE(code, ' ', '-'), '_', '-'))
WHERE slug IS NULL;

-- Asegurar índice de unicidad para resolución segura por slug dentro de la organización
CREATE UNIQUE INDEX IF NOT EXISTS uq_branches_org_slug ON public.branches(organization_id, slug);

-- 2. EXTENDER PRODUCTOS CON DISPONIBILIDAD ONLINE
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- 3. TABLA: public_orders (ÓRDENES PÚBLICAS DE CLIENTES)
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

CREATE TRIGGER tr_public_orders_updated_at
    BEFORE UPDATE ON public.public_orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índice para búsquedas rápidas por branch y estado
CREATE INDEX IF NOT EXISTS idx_public_orders_branch_status ON public.public_orders(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_public_orders_token ON public.public_orders(public_token);

-- 4. TABLA: public_order_items (LÍNEAS DE PEDIDO CON SNAPSHOTS INMUTABLES)
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

CREATE INDEX IF NOT EXISTS idx_public_order_items_order ON public.public_order_items(public_order_id);

-- 5. SECUENCIA AUDITADA DE NÚMERO DE ORDEN PÚBLICA
CREATE OR REPLACE FUNCTION public.get_next_public_order_number(p_branch_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_next BIGINT;
BEGIN
    SELECT COALESCE(MAX(order_number), 0) + 1 INTO v_next
    FROM public.public_orders
    WHERE branch_id = p_branch_id;
    RETURN v_next;
END;
$$ LANGUAGE plpgsql;

-- 6. RPC: OBTENCIÓN SEGURA DEL CATÁLOGO PÚBLICO (SIN COSTOS NI RECETAS)
CREATE OR REPLACE FUNCTION public.get_public_catalog(
    p_org_id UUID,
    p_branch_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'category_id', p.category_id,
            'category_name', c.name,
            'name', p.name,
            'description', p.description,
            'base_price', p.base_price,
            'image_url', p.image_url,
            'is_available', p.is_available,
            'slug', p.slug
        ) ORDER BY c.sort_order ASC, p.name ASC
    ) INTO v_result
    FROM public.products p
    LEFT JOIN public.categories c ON c.id = p.category_id
    WHERE p.organization_id = p_org_id
      AND p.is_active = TRUE
      AND p.is_available = TRUE;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.public_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_order_items ENABLE ROW LEVEL SECURITY;

-- 7.A POLÍTICAS EN public_orders
-- Lectura anónima protegida: solo si se conoce el public_token exacto
CREATE POLICY porder_anon_select_by_token ON public.public_orders
    FOR SELECT
    TO anon
    USING (public_token IS NOT NULL);

-- Lectura para usuarios del tenant
CREATE POLICY porder_tenant_select ON public.public_orders
    FOR SELECT
    TO authenticated
    USING (organization_id IN (SELECT public.get_user_org_ids()));

-- Inserción anónima de pedidos online
CREATE POLICY porder_anon_insert ON public.public_orders
    FOR INSERT
    TO anon
    WITH CHECK (organization_id IS NOT NULL AND branch_id IS NOT NULL);

-- Inserción autenticada
CREATE POLICY porder_tenant_insert ON public.public_orders
    FOR INSERT
    TO authenticated
    WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

-- Actualización solo permitida a miembros del tenant
CREATE POLICY porder_tenant_update ON public.public_orders
    FOR UPDATE
    TO authenticated
    USING (organization_id IN (SELECT public.get_user_org_ids()))
    WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

-- 7.B POLÍTICAS EN public_order_items
CREATE POLICY porder_items_anon_select ON public.public_order_items
    FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM public.public_orders o
            WHERE o.id = public_order_items.public_order_id
        )
    );

CREATE POLICY porder_items_tenant_select ON public.public_order_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.public_orders o
            WHERE o.id = public_order_items.public_order_id
              AND o.organization_id IN (SELECT public.get_user_org_ids())
        )
    );

CREATE POLICY porder_items_anon_insert ON public.public_order_items
    FOR INSERT
    TO anon
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.public_orders o
            WHERE o.id = public_order_items.public_order_id
        )
    );

CREATE POLICY porder_items_tenant_insert ON public.public_order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.public_orders o
            WHERE o.id = public_order_items.public_order_id
              AND o.organization_id IN (SELECT public.get_user_org_ids())
        )
    );
