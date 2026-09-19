-- ARBO OS — MIGRATION 20260919000005: ARBO CLUB, LOYALTY LEDGER & CRM
-- Version: 1.4.0
-- Description: Schema for customers, loyalty_transactions, rewards, reward_redemptions,
--              customer_id on sales, execute_reward_redemption RPC, and atomic loyalty integration in execute_sale_checkout.

-- 1. ENTIDAD DE CLIENTES (NIVEL ORGANIZACIÓN)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    registered_branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    document_id VARCHAR(50), -- DNI o CUIT
    birthday DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE (organization_id, phone)
);

CREATE TRIGGER tr_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. ASOCIAR CLIENTE A VENTAS (OPCIONAL, PERMITIENDO VENTAS ANÓNIMAS)
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- 3. CATÁLOGO DE RECOMPENSAS / BENEFICIOS DEL CLUB
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    points_required INT NOT NULL CHECK (points_required > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TRIGGER tr_rewards_updated_at
    BEFORE UPDATE ON public.rewards
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. REGISTRO DE CANJES / REDENCIONES
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
    points_spent INT NOT NULL CHECK (points_spent > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'CANCELLED')),
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. LIBRO MAYOR DE PUNTOS (APPEND-ONLY LEDGER)
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    points_delta INT NOT NULL CHECK (points_delta != 0),
    balance_after INT NOT NULL CHECK (balance_after >= 0),
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('EARN', 'REDEEM', 'ADJUSTMENT', 'REFUND', 'EXPIRE')),
    reference_type VARCHAR(30) CHECK (reference_type IN ('SALE', 'REDEMPTION', 'MANUAL', 'REFUND')),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Constraint de idempotencia: Una venta solo puede acreditar puntos una única vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_tx_idempotency 
ON public.loyalty_transactions(reference_type, reference_id, transaction_type)
WHERE reference_id IS NOT NULL;

-- 6. ÍNDICES DE RENDIMIENTO PARA CRM Y CHECKOUT
CREATE INDEX IF NOT EXISTS idx_customers_org_phone ON public.customers(organization_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_org_email ON public.customers(organization_id, email);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON public.sales(organization_id, customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON public.loyalty_transactions(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_org_active ON public.rewards(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_customer ON public.reward_redemptions(customer_id, created_at DESC);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Customers
CREATE POLICY "customers_select_policy" ON public.customers
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "customers_insert_policy" ON public.customers
FOR INSERT WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "customers_update_policy" ON public.customers
FOR UPDATE USING (organization_id IN (SELECT public.get_user_org_ids()));

-- Rewards
CREATE POLICY "rewards_select_policy" ON public.rewards
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "rewards_modify_policy" ON public.rewards
FOR ALL USING (public.is_org_admin(organization_id));

-- Reward Redemptions
CREATE POLICY "redemptions_select_policy" ON public.reward_redemptions
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "redemptions_insert_policy" ON public.reward_redemptions
FOR INSERT WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

-- Loyalty Transactions (Append-Only)
CREATE POLICY "loyalty_transactions_select_policy" ON public.loyalty_transactions
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "loyalty_transactions_insert_policy" ON public.loyalty_transactions
FOR INSERT WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

-- 8. FUNCIÓN RPC: REDENCIÓN ATÓMICA DE RECOMPENSAS
CREATE OR REPLACE FUNCTION public.execute_reward_redemption(
    p_org_id UUID,
    p_branch_id UUID,
    p_customer_id UUID,
    p_reward_id UUID,
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_customer RECORD;
    v_reward RECORD;
    v_current_balance INT := 0;
    v_new_balance INT := 0;
    v_redemption_id UUID;
BEGIN
    -- 1. Bloquear y verificar cliente
    SELECT * INTO v_customer
    FROM public.customers
    WHERE id = p_customer_id
      AND organization_id = p_org_id
    FOR UPDATE;

    IF v_customer.id IS NULL THEN
        RAISE EXCEPTION 'CUSTOMER_NOT_FOUND: Cliente no encontrado o no pertenece a la organización.';
    END IF;

    IF v_customer.status != 'ACTIVE' THEN
        RAISE EXCEPTION 'CUSTOMER_INACTIVE: El cliente no se encuentra activo para canjes.';
    END IF;

    -- 2. Verificar recompensa
    SELECT * INTO v_reward
    FROM public.rewards
    WHERE id = p_reward_id
      AND organization_id = p_org_id
      AND is_active = TRUE;

    IF v_reward.id IS NULL THEN
        RAISE EXCEPTION 'REWARD_NOT_FOUND: La recompensa solicitada no existe o no está activa.';
    END IF;

    -- 3. Calcular saldo actual acumulado en el ledger
    SELECT COALESCE(SUM(points_delta), 0) INTO v_current_balance
    FROM public.loyalty_transactions
    WHERE customer_id = p_customer_id;

    IF v_current_balance < v_reward.points_required THEN
        RAISE EXCEPTION 'INSUFFICIENT_POINTS: Saldo insuficiente (Disponible: %, Requerido: %)',
            v_current_balance, v_reward.points_required;
    END IF;

    v_new_balance := v_current_balance - v_reward.points_required;

    -- 4. Insertar registro de redención
    INSERT INTO public.reward_redemptions (
        organization_id,
        branch_id,
        customer_id,
        reward_id,
        points_spent,
        status,
        created_by
    ) VALUES (
        p_org_id,
        p_branch_id,
        p_customer_id,
        p_reward_id,
        v_reward.points_required,
        'COMPLETED',
        p_user_id
    ) RETURNING id INTO v_redemption_id;

    -- 5. Insertar movimiento en libro mayor de fidelización (delta negativo)
    INSERT INTO public.loyalty_transactions (
        organization_id,
        branch_id,
        customer_id,
        points_delta,
        balance_after,
        transaction_type,
        reference_type,
        reference_id,
        notes,
        created_by
    ) VALUES (
        p_org_id,
        p_branch_id,
        p_customer_id,
        -v_reward.points_required,
        v_new_balance,
        'REDEEM',
        'REDEMPTION',
        v_redemption_id,
        'Canje recompensa: ' || v_reward.name,
        p_user_id
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'redemption_id', v_redemption_id,
        'reward_name', v_reward.name,
        'points_spent', v_reward.points_required,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. ACTUALIZAR execute_sale_checkout CON INTEGRACIÓN ATÓMICA DE ARBO CLUB
CREATE OR REPLACE FUNCTION public.execute_sale_checkout(
    p_org_id UUID,
    p_branch_id UUID,
    p_cash_session_id UUID,
    p_user_id UUID,
    p_items JSONB, -- Array de objetos [{ product_id, quantity, unit_price, notes }]
    p_payment_amount NUMERIC(12, 2),
    p_cash_tendered NUMERIC(12, 2) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_customer_id UUID DEFAULT NULL
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

    -- Variables para KDS
    v_default_station_id UUID;
    v_ticket_id UUID;
    v_next_ticket_number BIGINT;

    -- Variables para ARBO Club
    v_customer RECORD;
    v_points_earned INT := 0;
    v_curr_loyalty_balance INT := 0;
    v_new_loyalty_balance INT := 0;
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

    -- 2. Validar cliente si fue especificado
    IF p_customer_id IS NOT NULL THEN
        SELECT * INTO v_customer
        FROM public.customers
        WHERE id = p_customer_id
          AND organization_id = p_org_id;

        IF v_customer.id IS NULL THEN
            RAISE EXCEPTION 'INVALID_CUSTOMER: El cliente especificado no existe o no pertenece a la organización.';
        END IF;

        IF v_customer.status != 'ACTIVE' THEN
            RAISE EXCEPTION 'CUSTOMER_INACTIVE: El cliente no se encuentra en estado activo.';
        END IF;

        -- Bloquear cliente para serializar balance de puntos
        PERFORM id FROM public.customers WHERE id = p_customer_id FOR UPDATE;
    END IF;

    -- 3. Validar ítems
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'EMPTY_SALE_ITEMS: No se puede procesar una venta sin ítems.';
    END IF;

    -- 4. Calcular total de venta a partir de los productos en base de datos
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity NUMERIC, unit_price NUMERIC, notes TEXT)
    LOOP
        SELECT id, name, base_price, station_id INTO v_product
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

    -- 5. Validar coincidencia de importe cobrado
    IF p_payment_amount != v_computed_total THEN
        RAISE EXCEPTION 'PAYMENT_TOTAL_MISMATCH: El importe a cobrar ($%) no coincide con el total calculado de la venta ($%).', p_payment_amount, v_computed_total;
    END IF;

    v_cash_tendered := COALESCE(p_cash_tendered, p_payment_amount);
    IF v_cash_tendered < p_payment_amount THEN
        RAISE EXCEPTION 'INSUFFICIENT_PAYMENT: El monto recibido en efectivo ($%) es menor al total ($%).', v_cash_tendered, p_payment_amount;
    END IF;
    v_change_given := v_cash_tendered - p_payment_amount;

    -- 6. Generar número de venta atómico para la sucursal
    SELECT COALESCE(MAX(sale_number), 0) + 1 INTO v_next_sale_number
    FROM public.sales
    WHERE organization_id = p_org_id
      AND branch_id = p_branch_id;

    -- 7. Insertar cabecera de venta
    INSERT INTO public.sales (
        organization_id,
        branch_id,
        cash_session_id,
        customer_id,
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
        p_customer_id,
        v_next_sale_number,
        'PAID',
        v_computed_total,
        0.00,
        v_computed_total,
        p_notes,
        p_user_id
    ) RETURNING id INTO v_sale_id;

    -- 8. Insertar ítems con snapshots y procesar recetas
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity NUMERIC, unit_price NUMERIC, notes TEXT)
    LOOP
        SELECT id, name, base_price, station_id INTO v_product
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

        -- Explosión de receta
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
                PERFORM id FROM public.ingredients
                WHERE id = v_recipe_item.ingredient_id
                FOR UPDATE;

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

                IF v_recipe.waste_percentage > 0 THEN
                    v_depletion_qty := v_depletion_qty / (1.0 - (v_recipe.waste_percentage / 100.0));
                END IF;

                v_curr_stock := public.get_current_stock(p_org_id, p_branch_id, v_recipe_item.ingredient_id);
                IF v_curr_stock < v_depletion_qty THEN
                    RAISE EXCEPTION 'INSUFFICIENT_STOCK: Stock insuficiente para % (Disponible: %, Requerido: %)',
                        v_recipe_item.ingredient_name, v_curr_stock, v_depletion_qty;
                END IF;

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

    -- 9. Registrar pago en efectivo
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

    -- 10. Registrar movimiento en caja
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

    -- 11. Generar comanda KDS de forma atómica
    SELECT id INTO v_default_station_id
    FROM public.kitchen_stations
    WHERE branch_id = p_branch_id
      AND is_active = TRUE
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_default_station_id IS NULL THEN
        INSERT INTO public.kitchen_stations (organization_id, branch_id, name, code)
        VALUES (p_org_id, p_branch_id, 'Barra / Cafetería', 'BAR')
        RETURNING id INTO v_default_station_id;
    END IF;

    SELECT COALESCE(MAX(ticket_number), 0) + 1 INTO v_next_ticket_number
    FROM public.kitchen_tickets
    WHERE branch_id = p_branch_id;

    INSERT INTO public.kitchen_tickets (
        organization_id,
        branch_id,
        sale_id,
        station_id,
        ticket_number,
        status,
        notes,
        created_by
    ) VALUES (
        p_org_id,
        p_branch_id,
        v_sale_id,
        v_default_station_id,
        v_next_ticket_number,
        'NEW',
        p_notes,
        p_user_id
    ) RETURNING id INTO v_ticket_id;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity NUMERIC, unit_price NUMERIC, notes TEXT)
    LOOP
        SELECT id, name INTO v_product
        FROM public.products
        WHERE id = v_item.product_id;

        INSERT INTO public.kitchen_ticket_items (
            ticket_id,
            product_id,
            product_name_snapshot,
            quantity,
            notes,
            status
        ) VALUES (
            v_ticket_id,
            v_product.id,
            v_product.name,
            v_item.quantity,
            v_item.notes,
            'PENDING'
        );
    END LOOP;

    -- 12. ACREDITACIÓN ATÓMICA DE PUNTOS ARBO CLUB (SI HAY CLIENTE)
    IF p_customer_id IS NOT NULL THEN
        v_points_earned := FLOOR(v_computed_total / 100.00);

        IF v_points_earned > 0 THEN
            SELECT COALESCE(SUM(points_delta), 0) INTO v_curr_loyalty_balance
            FROM public.loyalty_transactions
            WHERE customer_id = p_customer_id;

            v_new_loyalty_balance := v_curr_loyalty_balance + v_points_earned;

            INSERT INTO public.loyalty_transactions (
                organization_id,
                branch_id,
                customer_id,
                points_delta,
                balance_after,
                transaction_type,
                reference_type,
                reference_id,
                notes,
                created_by
            ) VALUES (
                p_org_id,
                p_branch_id,
                p_customer_id,
                v_points_earned,
                v_new_loyalty_balance,
                'EARN',
                'SALE',
                v_sale_id,
                'Acreditación por venta #' || v_next_sale_number,
                p_user_id
            );
        END IF;
    END IF;

    -- 13. Retornar comprobante consolidado
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
        'change_given', v_change_given,
        'customer_id', p_customer_id,
        'points_earned', v_points_earned,
        'loyalty_balance', v_new_loyalty_balance,
        'kitchen_ticket', jsonb_build_object(
            'ticket_id', v_ticket_id,
            'ticket_number', v_next_ticket_number,
            'station_id', v_default_station_id,
            'status', 'NEW'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
