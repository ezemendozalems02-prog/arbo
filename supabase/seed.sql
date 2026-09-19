-- ARBO OS — SEED DATA FOR MULTI-TENANCY & AUTH TESTING
-- Description: Seeds two independent organizations, branches and staff for RLS isolation verification.

-- 1. ORGANIZACIÓN A: "Café Arbo Palermo SRL"
INSERT INTO public.organizations (id, name, legal_name, tax_id, currency, timezone)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Café Arbo Palermo',
    'Café Arbo Palermo SRL',
    '30-71829384-9',
    'ARS',
    'America/Argentina/Buenos_Aires'
) ON CONFLICT (id) DO NOTHING;

-- Sucursales Org A
INSERT INTO public.branches (id, organization_id, name, code, address, phone)
VALUES 
(
    '11111111-1111-1111-1111-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Palermo Soho',
    'PALERMO-01',
    'Honduras 4820, CABA',
    '+54 11 4820-1111'
),
(
    '11111111-1111-1111-1111-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Palermo Hollywood',
    'PALERMO-02',
    'Fitz Roy 1930, CABA',
    '+54 11 4820-2222'
) ON CONFLICT (id) DO NOTHING;

-- 2. ORGANIZACIÓN B: "Burger Arbo Belgrano SRL"
INSERT INTO public.organizations (id, name, legal_name, tax_id, currency, timezone)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Burger Arbo Belgrano',
    'Burger Arbo Belgrano SRL',
    '30-75928172-3',
    'ARS',
    'America/Argentina/Buenos_Aires'
) ON CONFLICT (id) DO NOTHING;

-- Sucursal Org B
INSERT INTO public.branches (id, organization_id, name, code, address, phone)
VALUES (
    '22222222-2222-2222-2222-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Belgrano R',
    'BELGRANO-01',
    'Echeverría 3120, CABA',
    '+54 11 4780-9999'
) ON CONFLICT (id) DO NOTHING;

-- 3. PERFILES DE USUARIO MOCK/SEED
INSERT INTO public.user_profiles (id, first_name, last_name, phone)
VALUES 
(
    'a0000000-0000-0000-0000-000000000001',
    'Thiago (Dueño)',
    'Mendoza',
    '+54 11 5555-0001'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Martín (Cajero)',
    'Gómez',
    '+54 11 5555-0002'
),
(
    'b0000000-0000-0000-0000-000000000001',
    'Lucía (Dueña Belgrano)',
    'Rivadavia',
    '+54 11 5555-0003'
) ON CONFLICT (id) DO NOTHING;

-- 4. ASIGNACIÓN DE MEMBRESÍAS Y ROLES (RBAC)
INSERT INTO public.user_memberships (user_id, organization_id, branch_id, role)
VALUES 
-- User A1 es OWNER de Organización A (acceso total a todas las sucursales de Org A)
(
    'a0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'OWNER'
),
-- User A2 es CASHIER de Sucursal Palermo Soho en Organización A
(
    'a0000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-000000000001',
    'CASHIER'
),
-- User B1 es OWNER de Organización B (Burger Belgrano)
(
    'b0000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    NULL,
    'OWNER'
) ON CONFLICT DO NOTHING;

-- 5. FASE 2: CATÁLOGO Y RECETAS (CASO BASE OBLIGATORIO)

-- Categoría
INSERT INTO public.categories (id, organization_id, name, sort_order, is_active)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Cafetería de Especialidad',
    1,
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Insumo Base: Café Grano (Costo: $15.000/kg)
INSERT INTO public.ingredients (id, organization_id, name, base_unit, current_cost_unit, min_stock_alert)
VALUES (
    'i0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Café Grano Especialidad',
    'kg',
    15000.0000,
    1.0000
) ON CONFLICT (id) DO NOTHING;

-- Producto Final: Espresso Doble ($3.500 ARS)
INSERT INTO public.products (id, organization_id, category_id, name, description, base_price, is_active)
VALUES (
    'p0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'c0000000-0000-0000-0000-000000000001',
    'Espresso Doble',
    'Doble shot de café de especialidad de origen seleccionado.',
    3500.00,
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Ficha Técnica / Receta: Espresso Doble
INSERT INTO public.recipes (id, organization_id, product_id, yield_portions, waste_percentage)
VALUES (
    'r0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'p0000000-0000-0000-0000-000000000001',
    1.00,
    0.00
) ON CONFLICT (id) DO NOTHING;

-- Ítem de Receta: 18g de Café Grano
INSERT INTO public.recipe_items (id, recipe_id, ingredient_id, quantity, unit)
VALUES (
    'ri000000-0000-0000-0000-000000000001',
    'r0000000-0000-0000-0000-000000000001',
    'i0000000-0000-0000-0000-000000000001',
    18.0000,
    'g'
) ON CONFLICT (id) DO NOTHING;

-- 6. STOCK INICIAL: 5.000 kg de Café Grano en Palermo Soho
INSERT INTO public.inventory_movements (id, organization_id, branch_id, ingredient_id, movement_type, quantity_delta, unit_cost_snapshot, reason)
VALUES (
    'm0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-000000000001',
    'i0000000-0000-0000-0000-000000000001',
    'INITIAL_STOCK',
    5.0000,
    15000.0000,
    'Stock inicial de apertura de sucursal'
) ON CONFLICT (id) DO NOTHING;

