-- ARBO OS — MIGRATION 20260919000003: SALES, CASH REGISTERS & ACID TRANSACTION
-- Version: 1.2.0
-- Description: Schema for cash_registers, cash_sessions, cash_movements, sales, sale_items, payments,
--              Row Level Security policies, and the atomic execute_sale_checkout() RPC transaction.

-- 1. PUNTOS DE CAJA / REGISTRADORAS
CREATE TABLE IF NOT EXISTS public.cash_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TRIGGER tr_cash_registers_updated_at
    BEFORE UPDATE ON public.cash_registers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. SESIONES / TURNOS DE CAJA (HISTORIAL AUDITABLE INMUTABLE)
CREATE TABLE IF NOT EXISTS public.cash_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    cash_register_id UUID NOT NULL REFERENCES public.cash_registers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    opened_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    closed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    initial_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (initial_amount >= 0),
    closing_declared_amount NUMERIC(12, 2) CHECK (closing_declared_amount >= 0),
    closing_expected_amount NUMERIC(12, 2) CHECK (closing_expected_amount >= 0),
    closing_difference NUMERIC(12, 2),
    notes TEXT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    closed_at TIMESTAMPTZ
);

-- 3. MOVIMIENTOS DE CAJA (LIBRO MAYOR APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    cash_session_id UUID NOT NULL REFERENCES public.cash_sessions(id) ON DELETE CASCADE,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('OPENING', 'SALE', 'REFUND', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount != 0),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH' CHECK (payment_method IN ('CASH')),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. VENTAS (CABECERA)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    cash_session_id UUID REFERENCES public.cash_sessions(id) ON DELETE SET NULL,
    sale_number BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (status IN ('DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED')),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE (organization_id, branch_id, sale_number)
);

CREATE TRIGGER tr_sales_updated_at
    BEFORE UPDATE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. LÍNEAS DE VENTA (DETALLE CON SNAPSHOT INMUTABLE DE PRECIO Y PRODUCTO)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name_snapshot VARCHAR(255) NOT NULL,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    unit_price_snapshot NUMERIC(12, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 6. COBROS / PAGOS ASOCIADOS A VENTAS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    cash_session_id UUID REFERENCES public.cash_sessions(id) ON DELETE SET NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH' CHECK (payment_method IN ('CASH')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    cash_tendered NUMERIC(12, 2) CHECK (cash_tendered >= amount),
    change_given NUMERIC(12, 2) CHECK (change_given >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 7. ÍNDICES DE RENDIMIENTO Y MULTI-TENANCY
CREATE INDEX IF NOT EXISTS idx_cash_registers_org_branch ON public.cash_registers(organization_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_lookup ON public.cash_sessions(organization_id, branch_id, status);
CREATE INDEX IF NOT EXISTS idx_cash_movements_session ON public.cash_movements(cash_session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_org_branch_status ON public.sales(organization_id, branch_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON public.payments(sale_id);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Cash Registers
CREATE POLICY "cash_registers_select_policy" ON public.cash_registers
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "cash_registers_modify_policy" ON public.cash_registers
FOR ALL USING (public.is_org_admin(organization_id));

-- Cash Sessions
CREATE POLICY "cash_sessions_select_policy" ON public.cash_sessions
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "cash_sessions_insert_policy" ON public.cash_sessions
FOR INSERT WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "cash_sessions_update_policy" ON public.cash_sessions
FOR UPDATE USING (organization_id IN (SELECT public.get_user_org_ids()));

-- Cash Movements
CREATE POLICY "cash_movements_select_policy" ON public.cash_movements
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "cash_movements_insert_policy" ON public.cash_movements
FOR INSERT WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

-- Sales
CREATE POLICY "sales_select_policy" ON public.sales
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "sales_insert_policy" ON public.sales
FOR INSERT WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "sales_update_policy" ON public.sales
FOR UPDATE USING (public.is_org_admin(organization_id));

-- Sale Items
CREATE POLICY "sale_items_select_policy" ON public.sale_items
FOR SELECT USING (
    sale_id IN (
        SELECT id FROM public.sales
        WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
);

CREATE POLICY "sale_items_insert_policy" ON public.sale_items
FOR INSERT WITH CHECK (
    sale_id IN (
        SELECT id FROM public.sales
        WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
);

-- Payments
CREATE POLICY "payments_select_policy" ON public.payments
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "payments_insert_policy" ON public.payments
FOR INSERT WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

-- 9. FUNCIÓN RPC: TRANSACCIÓN ACID INDIVISIBLE DE COBRO Y DESCARGA
CREATE OR REPLACE FUNCTION public.execute_sale_checkout(
    p_org_id UUID,
    p_branch_id UUID,
    p_cash_session_id UUID,
    p_user_id UUID,
    p_items JSONB, -- Array de objetos [{ product_id, quantity, unit_price }]
    p_payment_amount NUMERIC(12, 2),
    p_cash_tendered NUMERIC(12, 2) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_session_status VARCHAR(20);
    v_sale_id UUID;
    v_next_sale_number BIGINT;
    v_computed_total NUMERIC(12, 2) := 0.00;
    v_item RECORD;
    v_product RECORD;
    v_recipe RECORD;
    v_recipe_item RECORD;
    v_depletion_qty NUMERIC(12, 4);
    v_curr_stock NUMERIC(12, 4);
    v_cash_tendered NUMERIC(12, 2);
    v_change_given NUMERIC(12, 2) := 0.00;
    v_item_subtotal NUMERIC(12, 2);
BEGIN
    -- 1. Validar sesión de caja activa
    SELECT status INTO v_session_status
    FROM public.cash_sessions
    WHERE id = p_cash_session_id
      AND organization_id = p_org_id
      AND branch_id = p_branch_id;

    IF v_session_status IS NULL OR v_session_status != 'OPEN' THEN
        RAISE EXCEPTION 'CASH_SESSION_NOT_OPEN: La caja especificada no se encuentra abierta o no pertenece a la sucursal.';
    END IF;

    -- 2. Validar que vengan ítems
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'EMPTY_SALE_ITEMS: No se puede procesar una venta sin ítems.';
    END IF;

    -- 3. Calcular total de la venta a partir de los productos en base de datos
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity NUMERIC, unit_price NUMERIC)
    LOOP
        SELECT id, name, base_price INTO v_product
        FROM public.products
        WHERE id = v_item.product_id
          AND organization_id = p_org_id
          AND is_active = TRUE;

        IF v_product.id IS NULL THEN
            RAISE EXCEPTION 'INVALID_PRODUCT: El producto % no existe o no está activo.', v_item.product_id;
        END IF;

        IF v_item.quantity <= 0 THEN
            RAISE EXCEPTION 'INVALID_QUANTITY: La cantidad vendida debe ser mayor a 0.';
        END IF;

        v_item_subtotal := ROUND((v_item.quantity * v_product.base_price)::numeric, 2);
        v_computed_total := v_computed_total + v_item_subtotal;
    END LOOP;

    -- 4. Validar coincidencia de importe cobrado
    IF p_payment_amount != v_computed_total THEN
        RAISE EXCEPTION 'PAYMENT_TOTAL_MISMATCH: El importe a cobrar ($%) no coincide con el total calculado de la venta ($%).', p_payment_amount, v_computed_total;
    END IF;

    v_cash_tendered := COALESCE(p_cash_tendered, p_payment_amount);
    IF v_cash_tendered < p_payment_amount THEN
        RAISE EXCEPTION 'INSUFFICIENT_PAYMENT: El monto recibido en efectivo ($%) es menor al total ($%).', v_cash_tendered, p_payment_amount;
    END IF;
    v_change_given := v_cash_tendered - p_payment_amount;

    -- 5. Generar número de venta atómico para la sucursal
    SELECT COALESCE(MAX(sale_number), 0) + 1 INTO v_next_sale_number
    FROM public.sales
    WHERE organization_id = p_org_id
      AND branch_id = p_branch_id;

    -- 6. Insertar cabecera de venta
    INSERT INTO public.sales (
        organization_id,
        branch_id,
        cash_session_id,
        sale_number,
        status,
        subtotal,
        discount_amount,
        total,
        notes,
        created_by
    ) VALUES (
        p_org_id,
        p_branch_id,
        p_cash_session_id,
        v_next_sale_number,
        'PAID',
        v_computed_total,
        0.00,
        v_computed_total,
        p_notes,
        p_user_id
    ) RETURNING id INTO v_sale_id;

    -- 7. Insertar ítems con snapshots y procesar explosión de recetas
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity NUMERIC, unit_price NUMERIC)
    LOOP
        SELECT id, name, base_price INTO v_product
        FROM public.products
        WHERE id = v_item.product_id;

        v_item_subtotal := ROUND((v_item.quantity * v_product.base_price)::numeric, 2);

        INSERT INTO public.sale_items (
            sale_id,
            product_id,
            product_name_snapshot,
            quantity,
            unit_price_snapshot,
            subtotal
        ) VALUES (
            v_sale_id,
            v_product.id,
            v_product.name,
            v_item.quantity,
            v_product.base_price,
            v_item_subtotal
        );

        -- Explosión de receta si el producto la posee
        SELECT * INTO v_recipe
        FROM public.recipes
        WHERE product_id = v_product.id
          AND organization_id = p_org_id;

        IF v_recipe.id IS NOT NULL THEN
            FOR v_recipe_item IN
                SELECT ri.ingredient_id, ri.quantity AS item_qty, ri.unit AS item_unit,
                       i.name AS ingredient_name, i.base_unit, i.current_cost_unit
                FROM public.recipe_items ri
                JOIN public.ingredients i ON i.id = ri.ingredient_id
                WHERE ri.recipe_id = v_recipe.id
            LOOP
                -- Bloquear el ingrediente contra race conditions concurrentes
                PERFORM id FROM public.ingredients
                WHERE id = v_recipe_item.ingredient_id
                FOR UPDATE;

                -- Calcular consumo en unidad base del ingrediente
                -- Regla de conversión estándar
                IF v_recipe_item.item_unit = 'g' AND v_recipe_item.base_unit = 'kg' THEN
                    v_depletion_qty := (v_item.quantity * v_recipe_item.item_qty) / 1000.0000;
                ELSIF v_recipe_item.item_unit = 'ml' AND v_recipe_item.base_unit = 'l' THEN
                    v_depletion_qty := (v_item.quantity * v_recipe_item.item_qty) / 1000.0000;
                ELSIF v_recipe_item.item_unit = v_recipe_item.base_unit THEN
                    v_depletion_qty := (v_item.quantity * v_recipe_item.item_qty);
                ELSE
                    RAISE EXCEPTION 'INCOMPATIBLE_UNIT: No se puede convertir de % a % para el ingrediente %',
                        v_recipe_item.item_unit, v_recipe_item.base_unit, v_recipe_item.ingredient_name;
                END IF;

                -- Ajuste por merma si existe
                IF v_recipe.waste_percentage > 0 THEN
                    v_depletion_qty := v_depletion_qty / (1.0 - (v_recipe.waste_percentage / 100.0));
                END IF;

                -- Verificar stock disponible (Política estricta)
                v_curr_stock := public.get_current_stock(p_org_id, p_branch_id, v_recipe_item.ingredient_id);
                IF v_curr_stock < v_depletion_qty THEN
                    RAISE EXCEPTION 'INSUFFICIENT_STOCK: Stock insuficiente para % (Disponible: %, Requerido: %)',
                        v_recipe_item.ingredient_name, v_curr_stock, v_depletion_qty;
                END IF;

                -- Registrar movimiento inmutable en el libro mayor de inventario
                INSERT INTO public.inventory_movements (
                    organization_id,
                    branch_id,
                    ingredient_id,
                    movement_type,
                    quantity_delta,
                    unit_cost_snapshot,
                    reference_id,
                    reason,
                    created_by
                ) VALUES (
                    p_org_id,
                    p_branch_id,
                    v_recipe_item.ingredient_id,
                    'SALE_DEPLETION',
                    -v_depletion_qty,
                    v_recipe_item.current_cost_unit,
                    v_sale_id,
                    'Consumo por venta #' || v_next_sale_number,
                    p_user_id
                );
            END LOOP;
        END IF;
    END LOOP;

    -- 8. Registrar pago en efectivo
    INSERT INTO public.payments (
        organization_id,
        branch_id,
        sale_id,
        cash_session_id,
        payment_method,
        amount,
        cash_tendered,
        change_given
    ) VALUES (
        p_org_id,
        p_branch_id,
        v_sale_id,
        p_cash_session_id,
        'CASH',
        p_payment_amount,
        v_cash_tendered,
        v_change_given
    );

    -- 9. Registrar movimiento en libro mayor de caja
    INSERT INTO public.cash_movements (
        organization_id,
        branch_id,
        cash_session_id,
        movement_type,
        amount,
        payment_method,
        reference_id,
        notes,
        created_by
    ) VALUES (
        p_org_id,
        p_branch_id,
        p_cash_session_id,
        'SALE',
        p_payment_amount,
        'CASH',
        v_sale_id,
        'Cobro venta #' || v_next_sale_number,
        p_user_id
    );

    -- 10. Retornar comprobante estructurado
    RETURN jsonb_build_object(
        'success', TRUE,
        'sale_id', v_sale_id,
        'sale_number', v_next_sale_number,
        'status', 'PAID',
        'subtotal', v_computed_total,
        'total', v_computed_total,
        'payment_method', 'CASH',
        'amount_paid', p_payment_amount,
        'cash_tendered', v_cash_tendered,
        'change_given', v_change_given
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
