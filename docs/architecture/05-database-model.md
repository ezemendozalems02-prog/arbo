# 05 — MODELO RELACIONAL POSTGRESQL EXHAUSTIVO

---

## 1. CONVENCIONES Y ESTÁNDARES DEL MODELO

El modelo de datos relacional de ARBO OS sigue los estándares de ingeniería de bases de datos relacionales más rigurosos:
1. **Identificadores:** Todas las tablas utilizan `UUID v4` como Clave Primaria (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`).
2. **Auditoría Básica Obligatoria:** Todo registro incluye `created_at TIMESTAMPTZ DEFAULT clock_timestamp()` y `updated_at TIMESTAMPTZ DEFAULT clock_timestamp()`. Las tablas mutables implementan un trigger automático para actualizar `updated_at`.
3. **Multi-Tenancy Explícito:** Toda entidad contiene `organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE`.
4. **Tipos Monetarios y Decimales:** Se prohibe el uso de `FLOAT` o `REAL`. Se utiliza estrictamente `NUMERIC(12, 4)` para costos unitarios y cantidades de recetas, y `NUMERIC(12, 2)` para montos monetarios finales de venta y caja.
5. **Borrado Lógico vs Inmutabilidad:** Los catálogos usan `deleted_at TIMESTAMPTZ NULL` (Soft Delete). Las tablas de transacciones y ledgers son estrictamente inmutables (Append-Only).

---

## 2. DOMINIO 1: TENANCY, SUCURSALES & USUARIOS

```sql
-- 1.1. Organizaciones (Tenant Raíz)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50), -- CUIT en Argentina
    currency VARCHAR(10) DEFAULT 'ARS',
    timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 1.2. Sucursales (Puntos de Venta Físicos)
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL, -- ej. "PALERMO-01"
    address TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(organization_id, code)
);

-- 1.3. Depósitos Físicos (Warehouses)
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL, -- NULL si es depósito central compartido
    name VARCHAR(100) NOT NULL, -- ej. "Barra", "Cocina", "Depósito Central"
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 1.4. Perfiles de Usuarios y Asignación de Roles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE, -- NULL si es Admin Global
    role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN', 'ACCOUNTANT')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(user_id, organization_id, branch_id)
);
```

---

## 3. DOMINIO 2: CATÁLOGO, PRODUCTOS & RECETAS (FICHAS TÉCNICAS)

```sql
-- 2.1. Categorías de Menú
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 2.2. Productos Finales de Venta
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    target_station VARCHAR(50) DEFAULT 'KITCHEN', -- KITCHEN, BAR, BAKERY
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 2.3. Variantes de Producto (ej. Chico, Mediano, Grande)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_delta NUMERIC(12, 2) DEFAULT 0,
    sku VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 2.4. Modificadores y Agrupaciones (ej. Tipo de Leche, Extras)
CREATE TABLE modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- ej. "Tipo de Leche"
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- ej. "Leche de Almendras"
    extra_price NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 2.5. Materias Primas / Ingredientes Base
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    base_unit VARCHAR(20) NOT NULL CHECK (base_unit IN ('KG', 'G', 'L', 'ML', 'UNIT')),
    current_cost_unit NUMERIC(12, 4) DEFAULT 0, -- Costo PPP
    min_stock_alert NUMERIC(12, 4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 2.6. Fichas Técnicas / Recetas
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    yield_portions NUMERIC(12, 2) DEFAULT 1.0,
    waste_percentage NUMERIC(5, 2) DEFAULT 0.0, -- Factor de Merma (ej. 10.0%)
    indirect_cost_markup NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(product_id, variant_id)
);

CREATE TABLE recipe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);
```

---

## 4. DOMINIO 3: INVENTARIO & COMPRAS (LEDGER INMUTABLE)

```sql
-- 3.1. Libro Mayor de Inventario (INMUTABLE - APPEND ONLY)
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('PURCHASE', 'SALE_DEPLETION', 'WASTE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT')),
    quantity_delta NUMERIC(12, 4) NOT NULL, -- Positivo (ingreso) o Negativo (egreso)
    unit_cost_snapshot NUMERIC(12, 4) NOT NULL, -- Costo al momento del movimiento
    reference_id UUID, -- order_id, purchase_id o transfer_id
    reason TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 3.2. Proveedores y Compras
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    contact_name VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE purchase_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'CONFIRMED' CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_invoice_id UUID NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    package_quantity NUMERIC(12, 2) NOT NULL, -- ej. 5 bultos
    package_unit VARCHAR(50) NOT NULL, -- ej. "CAJON 20KG"
    conversion_factor NUMERIC(12, 4) NOT NULL, -- 20.0
    total_base_quantity NUMERIC(12, 4) NOT NULL, -- 100 kg
    total_cost NUMERIC(12, 2) NOT NULL,
    unit_cost NUMERIC(12, 4) NOT NULL -- total_cost / total_base_quantity
);
```

---

## 5. DOMINIO 4: MESAS, COMANDAS & VENTAS TRANSACCIONALES

```sql
-- 4.1. Mesas y Sesiones de Salón
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_number VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 4,
    pos_x INT DEFAULT 0,
    pos_y INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'BILL_REQUESTED')),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(branch_id, table_number)
);

CREATE TABLE table_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
    opened_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    closed_at TIMESTAMPTZ,
    waiter_id UUID REFERENCES user_profiles(id),
    diners_count INT DEFAULT 1
);

-- 4.2. Órdenes de Venta
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
    customer_id UUID, -- Vinculado a tabla customers
    order_type VARCHAR(30) NOT NULL CHECK (order_type IN ('DINE_IN', 'TAKEAWAY', 'DELIVERY')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'SETTLED', 'CANCELLED')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    final_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    settled_at TIMESTAMPTZ
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    line_total NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    kitchen_status VARCHAR(30) DEFAULT 'PENDING' CHECK (kitchen_status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 4.3. Pagos y Cobros
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    cash_shift_id UUID NOT NULL, -- Vinculado a cash_shifts
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('CASH', 'MERCADOPAGO_QR', 'DEBIT_CARD', 'CREDIT_CARD', 'LOYALTY_POINTS')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    tip_amount NUMERIC(12, 2) DEFAULT 0,
    external_reference VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);
```

---

## 6. DOMINIO 5: CONTROL DE CAJA Y ARQUEO CIEGO

```sql
-- 5.1. Turnos de Caja (Cash Shifts)
CREATE TABLE cash_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    cashier_id UUID NOT NULL REFERENCES user_profiles(id),
    opening_balance NUMERIC(12, 2) NOT NULL CHECK (opening_balance >= 0),
    closing_balance_real NUMERIC(12, 2), -- Declarado en Arqueo Ciego
    closing_balance_theoretical NUMERIC(12, 2), -- Calculado por sistema
    discrepancy NUMERIC(12, 2), -- real - theoretical
    status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    opened_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    closed_at TIMESTAMPTZ
);

-- 5.2. Libro Mayor de Caja (INMUTABLE - APPEND ONLY)
CREATE TABLE cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_shift_id UUID NOT NULL REFERENCES cash_shifts(id) ON DELETE RESTRICT,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('SALE_PAYMENT', 'MANUAL_INCOME', 'MANUAL_EXPENSE', 'TIP_OUT')),
    payment_method VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL, -- Positivo o Negativo
    reference_id UUID, -- order_id o payment_id
    reason TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);
```

---

## 7. DOMINIO 6: CLIENTES & ARBO CLUB (LEDGER DE FIDELIZACIÓN)

```sql
-- 6.1. Directorio de Clientes
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    birth_date DATE,
    total_spent NUMERIC(12, 2) DEFAULT 0,
    visit_count INT DEFAULT 0,
    current_tier VARCHAR(50) DEFAULT 'BRONZE',
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(organization_id, phone)
);

-- 6.2. Ledger de Puntos de Lealtad (INMUTABLE - APPEND ONLY)
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    points_delta INT NOT NULL, -- Positivo (acumulación) o Negativo (canje)
    reason VARCHAR(100) NOT NULL, -- ej. "SALE_REWARD", "REDEMPTION_COFFEE"
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);
```

---

## 8. ÍNDICES DE RENDIMIENTO CLAVE

Para garantizar tiempos de respuesta inferiores a 50 ms en operaciones de alta frecuencia:
```sql
CREATE INDEX idx_orders_branch_status ON orders(branch_id, status);
CREATE INDEX idx_inventory_movements_lookup ON inventory_movements(ingredient_id, warehouse_id, created_at DESC);
CREATE INDEX idx_cash_movements_shift ON cash_movements(cash_shift_id);
CREATE INDEX idx_loyalty_customer_balance ON loyalty_transactions(customer_id);
CREATE INDEX idx_recipes_product ON recipes(product_id, variant_id);
```
