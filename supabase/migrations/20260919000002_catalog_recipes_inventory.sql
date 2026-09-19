-- ARBO OS — MIGRATION 20260919000002: CATALOG, RECIPES & INVENTORY MOVEMENTS
-- Version: 1.1.0
-- Description: Schema for categories, products, ingredients, recipes, recipe items, and append-only inventory movements.

-- 1. CATEGORÍAS DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TRIGGER tr_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. PRODUCTOS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TRIGGER tr_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. INGREDIENTES / MATERIAS PRIMAS
CREATE TABLE IF NOT EXISTS public.ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    base_unit VARCHAR(20) NOT NULL CHECK (base_unit IN ('kg', 'g', 'l', 'ml', 'u')),
    current_cost_unit NUMERIC(12, 4) NOT NULL DEFAULT 0.0000 CHECK (current_cost_unit >= 0),
    min_stock_alert NUMERIC(12, 4) DEFAULT 0.0000,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TRIGGER tr_ingredients_updated_at
    BEFORE UPDATE ON public.ingredients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. RECETAS / FICHAS TÉCNICAS (CABECERA)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    yield_portions NUMERIC(12, 2) NOT NULL DEFAULT 1.00 CHECK (yield_portions > 0),
    waste_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (waste_percentage >= 0 AND waste_percentage < 100),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(organization_id, product_id)
);

CREATE TRIGGER tr_recipes_updated_at
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. ÍTEMS DE RECETA (DETALLE DE INSUMOS)
CREATE TABLE IF NOT EXISTS public.recipe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'g', 'l', 'ml', 'u')),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(recipe_id, ingredient_id)
);

-- 6. MOVIMIENTOS DE INVENTARIO (LIBRO MAYOR INMUTABLE / APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('INITIAL_STOCK', 'PURCHASE', 'ADJUSTMENT', 'SALE_DEPLETION', 'WASTE', 'TRANSFER_IN', 'TRANSFER_OUT')),
    quantity_delta NUMERIC(12, 4) NOT NULL,
    unit_cost_snapshot NUMERIC(12, 4) NOT NULL DEFAULT 0.0000 CHECK (unit_cost_snapshot >= 0),
    reference_id UUID,
    reason TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 7. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_categories_org ON public.categories(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_org_cat ON public.products(organization_id, category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ingredients_org ON public.ingredients(organization_id, name);
CREATE INDEX IF NOT EXISTS idx_recipes_product ON public.recipes(organization_id, product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_items_lookup ON public.recipe_items(recipe_id, ingredient_id);
CREATE INDEX IF NOT EXISTS idx_inv_movements_lookup ON public.inventory_movements(organization_id, branch_id, ingredient_id, created_at DESC);

-- 8. FUNCIÓN SQL PARA OBTENER STOCK ACTUAL POR AGREGACIÓN DE DELTAS
CREATE OR REPLACE FUNCTION public.get_current_stock(p_org_id UUID, p_branch_id UUID, p_ingredient_id UUID)
RETURNS NUMERIC(12, 4) AS $$
    SELECT COALESCE(SUM(quantity_delta), 0.0000)
    FROM public.inventory_movements
    WHERE organization_id = p_org_id
      AND branch_id = p_branch_id
      AND ingredient_id = p_ingredient_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_policy" ON public.categories
FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids())
);

CREATE POLICY "categories_modify_policy" ON public.categories
FOR ALL USING (
    public.is_org_admin(organization_id)
);

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_policy" ON public.products
FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids())
);

CREATE POLICY "products_modify_policy" ON public.products
FOR ALL USING (
    public.is_org_admin(organization_id)
);

-- Ingredients
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingredients_select_policy" ON public.ingredients
FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids())
);

CREATE POLICY "ingredients_modify_policy" ON public.ingredients
FOR ALL USING (
    public.is_org_admin(organization_id)
);

-- Recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes_select_policy" ON public.recipes
FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids())
);

CREATE POLICY "recipes_modify_policy" ON public.recipes
FOR ALL USING (
    public.is_org_admin(organization_id)
);

-- Recipe Items
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipe_items_select_policy" ON public.recipe_items
FOR SELECT USING (
    recipe_id IN (
        SELECT id FROM public.recipes
        WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
);

CREATE POLICY "recipe_items_modify_policy" ON public.recipe_items
FOR ALL USING (
    recipe_id IN (
        SELECT id FROM public.recipes
        WHERE public.is_org_admin(organization_id)
    )
);

-- Inventory Movements
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inv_movements_select_policy" ON public.inventory_movements
FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids())
);

CREATE POLICY "inv_movements_insert_policy" ON public.inventory_movements
FOR INSERT WITH CHECK (
    organization_id IN (SELECT public.get_user_org_ids())
);
