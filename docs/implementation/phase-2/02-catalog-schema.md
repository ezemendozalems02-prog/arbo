# ARBO OS — FASE 2: ESQUEMA DE BASE DE DATOS (CATÁLOGO & INVENTARIO)

**Estado:** Implementado y Validado en Migración PostgreSQL Versionada  
**Migración:** `supabase/migrations/20260919000002_catalog_recipes_inventory.sql`  
**Tenant Isolation:** Row Level Security (RLS) habilitado en 100% de las tablas nuevas.

---

## 1. TABLAS CREADAS Y DEFINICIÓN DDL

### 1.1 `categories`
Organización taxonómica de productos en el catálogo comercial.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `organization_id` UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
- `name` VARCHAR(100) NOT NULL
- `description` TEXT
- `color` VARCHAR(20) DEFAULT '#2D5A27'
- `icon` VARCHAR(50) DEFAULT 'coffee'
- `sort_order` INT DEFAULT 0
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- **Constraint**: `unique_category_name_per_org` UNIQUE (`organization_id`, `name`)

### 1.2 `products`
Artículos comercializables (platos, bebidas, retail).
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `organization_id` UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
- `category_id` UUID REFERENCES categories(id) ON DELETE SET NULL
- `branch_id` UUID REFERENCES branches(id) ON DELETE SET NULL
- `name` VARCHAR(150) NOT NULL
- `sku` VARCHAR(50)
- `description` TEXT
- `price` NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (`price` >= 0)
- `tax_rate` NUMERIC(5, 2) NOT NULL DEFAULT 21.00 CHECK (`tax_rate` >= 0)
- `cost` NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (`cost` >= 0)
- `has_recipe` BOOLEAN NOT NULL DEFAULT false
- `track_stock` BOOLEAN NOT NULL DEFAULT false
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())

### 1.3 `ingredients`
Insumos crudos para fichas técnicas y control de stock físico.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `organization_id` UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
- `branch_id` UUID REFERENCES branches(id) ON DELETE SET NULL
- `name` VARCHAR(150) NOT NULL
- `sku` VARCHAR(50)
- `base_unit` VARCHAR(20) NOT NULL CHECK (`base_unit` IN ('kg', 'g', 'l', 'ml', 'u'))
- `current_cost` NUMERIC(12, 4) NOT NULL DEFAULT 0.0000 CHECK (`current_cost` >= 0)
- `min_stock` NUMERIC(12, 4) NOT NULL DEFAULT 0.0000 CHECK (`min_stock` >= 0)
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- **Constraint**: `unique_ingredient_name_per_org` UNIQUE (`organization_id`, `name`)

### 1.4 `recipes`
Ficha técnica maestra asociada a un producto de venta.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `organization_id` UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
- `product_id` UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE
- `name` VARCHAR(150) NOT NULL
- `yield_portions` NUMERIC(8, 2) NOT NULL DEFAULT 1.00 CHECK (`yield_portions` > 0)
- `instructions` TEXT
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- **Constraint**: `unique_recipe_per_product` UNIQUE (`product_id`)

### 1.5 `recipe_items`
Líneas de insumo en una receta con soporte de unidades normalizadas y merma.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `recipe_id` UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE
- `ingredient_id` UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT
- `quantity` NUMERIC(12, 4) NOT NULL CHECK (`quantity` > 0)
- `unit` VARCHAR(20) NOT NULL CHECK (`unit` IN ('kg', 'g', 'l', 'ml', 'u'))
- `waste_pct` NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (`waste_pct` >= 0 AND `waste_pct` < 100)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- **Constraint**: `unique_ingredient_per_recipe` UNIQUE (`recipe_id`, `ingredient_id`)

### 1.6 `inventory_movements`
Libro mayor inmutable (append-only ledger) de movimientos físicos de stock.
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `organization_id` UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
- `branch_id` UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE
- `ingredient_id` UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT
- `movement_type` VARCHAR(30) NOT NULL CHECK (`movement_type` IN ('INITIAL_STOCK', 'PURCHASE_RECEIPT', 'SALE_DEPLETION', 'WASTE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT'))
- `quantity` NUMERIC(12, 4) NOT NULL CHECK (`quantity` != 0)
- `unit` VARCHAR(20) NOT NULL CHECK (`unit` IN ('kg', 'g', 'l', 'ml', 'u'))
- `unit_cost` NUMERIC(12, 4) CHECK (`unit_cost` >= 0)
- `total_cost` NUMERIC(12, 2) CHECK (`total_cost` >= 0)
- `reference_id` UUID
- `notes` TEXT
- `created_by` UUID REFERENCES auth.users(id) ON DELETE SET NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())

---

## 2. INTEGRIDAD REFERENCIAL Y PERFORMANCE

1. **Índices de Multi-tenancy**:
   - `idx_categories_org_id`
   - `idx_products_org_id`, `idx_products_cat_id`
   - `idx_ingredients_org_id`
   - `idx_recipes_org_id`, `idx_recipes_product_id`
   - `idx_recipe_items_recipe_id`, `idx_recipe_items_ingredient_id`
   - `idx_inv_movements_org_branch_ing`, `idx_inv_movements_created_at`
2. **Auditoría automática**:
   - Triggers `set_updated_at` conectados a `categories`, `products`, `ingredients`, `recipes`.
3. **Agregador SQL de Stock**:
   - Función `get_current_stock(p_ingredient_id UUID, p_branch_id UUID)` con `SECURITY DEFINER` que calcula la suma directa de deltas en la unidad base del insumo.
