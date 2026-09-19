-- ARBO OS — MIGRATION 20260919000004: KDS, STATIONS, TICKETS & REALTIME ENGINE
-- Version: 1.3.0
-- Description: Schema for kitchen_stations, kitchen_tickets, kitchen_ticket_items,
--              status transitions with timestamp auditing, RLS, and atomic ticket generation in execute_sale_checkout.

-- 1. ESTACIONES DE PRODUCCIÓN (COCINA, BARRA, CAFETERÍA, ETC.)
CREATE TABLE IF NOT EXISTS public.kitchen_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL, -- ej. 'BAR', 'KITCHEN'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE (branch_id, code)
);

CREATE TRIGGER tr_kitchen_stations_updated_at
    BEFORE UPDATE ON public.kitchen_stations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. VINCULAR PRODUCTOS A ESTACIÓN PREFERIDA (OPCIONAL, FALLBACK A DEFAULT)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS station_id UUID REFERENCES public.kitchen_stations(id) ON DELETE SET NULL;

-- 3. COMANDAS / TICKETS DE PRODUCCIÓN (CABECERA KDS)
CREATE TABLE IF NOT EXISTS public.kitchen_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES public.kitchen_stations(id) ON DELETE RESTRICT,
    ticket_number BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'PREPARING', 'READY', 'ARCHIVED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    started_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    cancelled_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    cancel_reason TEXT,
    UNIQUE (branch_id, ticket_number)
);

-- 4. ÍTEMS DE COMANDA (DETALLE OPERATIVO CON SNAPSHOTS)
CREATE TABLE IF NOT EXISTS public.kitchen_ticket_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.kitchen_tickets(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name_snapshot VARCHAR(255) NOT NULL,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'ARCHIVED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. ÍNDICES DE RENDIMIENTO PARA KDS EN VIVO
CREATE INDEX IF NOT EXISTS idx_kitchen_stations_branch ON public.kitchen_stations(branch_id, is_active);
CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_active ON public.kitchen_tickets(branch_id, station_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_sale ON public.kitchen_tickets(sale_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_ticket_items_ticket ON public.kitchen_ticket_items(ticket_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.kitchen_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_ticket_items ENABLE ROW LEVEL SECURITY;

-- Kitchen Stations Policies
CREATE POLICY "kitchen_stations_select_policy" ON public.kitchen_stations
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "kitchen_stations_modify_policy" ON public.kitchen_stations
FOR ALL USING (public.is_org_admin(organization_id));

-- Kitchen Tickets Policies
CREATE POLICY "kitchen_tickets_select_policy" ON public.kitchen_tickets
FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "kitchen_tickets_insert_policy" ON public.kitchen_tickets
FOR INSERT WITH CHECK (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "kitchen_tickets_update_policy" ON public.kitchen_tickets
FOR UPDATE USING (organization_id IN (SELECT public.get_user_org_ids()));

-- Kitchen Ticket Items Policies
CREATE POLICY "kitchen_ticket_items_select_policy" ON public.kitchen_ticket_items
FOR SELECT USING (
    ticket_id IN (
        SELECT id FROM public.kitchen_tickets
        WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
);

CREATE POLICY "kitchen_ticket_items_insert_policy" ON public.kitchen_ticket_items
FOR INSERT WITH CHECK (
    ticket_id IN (
        SELECT id FROM public.kitchen_tickets
        WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
);

CREATE POLICY "kitchen_ticket_items_update_policy" ON public.kitchen_ticket_items
FOR UPDATE USING (
    ticket_id IN (
        SELECT id FROM public.kitchen_tickets
        WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
);

-- 7. FUNCIÓN DE TRANSICIÓN IDEMPOTENTE Y SEGURA DE ESTADOS DE COMANDA
CREATE OR REPLACE FUNCTION public.transition_kitchen_ticket_status(
    p_ticket_id UUID,
    p_new_status VARCHAR(20),
    p_expected_current_status VARCHAR(20) DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_cancel_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_ticket RECORD;
    v_updated_ticket RECORD;
BEGIN
    SELECT * INTO v_ticket
    FROM public.kitchen_tickets
    WHERE id = p_ticket_id
    FOR UPDATE;

    IF v_ticket.id IS NULL THEN
        RAISE EXCEPTION 'TICKET_NOT_FOUND: No se encontró la comanda especificada.';
    END IF;

    -- Si ya se encuentra en el estado deseado, retorno idempotente sin error
    IF v_ticket.status = p_new_status THEN
        RETURN jsonb_build_object(
            'success', TRUE,
            'ticket_id', v_ticket.id,
            'status', v_ticket.status,
            'message', 'IDEMPOTENT_NOOP'
        );
    END IF;

    -- Validar estado actual si se proporcionó una precondición
    IF p_expected_current_status IS NOT NULL AND v_ticket.status != p_expected_current_status THEN
        RAISE EXCEPTION 'INVALID_STATUS_TRANSITION: La comanda está en % y se esperaba % para pasar a %.',
            v_ticket.status, p_expected_current_status, p_new_status;
    END IF;

    -- Actualizar ticket con marca de tiempo correspondiente
    UPDATE public.kitchen_tickets
    SET status = p_new_status,
        started_at = CASE WHEN p_new_status = 'PREPARING' AND started_at IS NULL THEN clock_timestamp() ELSE started_at END,
        ready_at = CASE WHEN p_new_status = 'READY' AND ready_at IS NULL THEN clock_timestamp() ELSE ready_at END,
        archived_at = CASE WHEN p_new_status = 'ARCHIVED' AND archived_at IS NULL THEN clock_timestamp() ELSE archived_at END,
        cancelled_at = CASE WHEN p_new_status = 'CANCELLED' AND cancelled_at IS NULL THEN clock_timestamp() ELSE cancelled_at END,
        cancelled_by = CASE WHEN p_new_status = 'CANCELLED' THEN p_user_id ELSE cancelled_by END,
        cancel_reason = CASE WHEN p_new_status = 'CANCELLED' THEN p_cancel_reason ELSE cancel_reason END
    WHERE id = p_ticket_id
    RETURNING * INTO v_updated_ticket;

    -- Propagar estado a las líneas de comanda
    UPDATE public.kitchen_ticket_items
    SET status = CASE 
        WHEN p_new_status = 'PREPARING' THEN 'PREPARING'
        WHEN p_new_status = 'READY' THEN 'READY'
        WHEN p_new_status = 'ARCHIVED' THEN 'ARCHIVED'
        WHEN p_new_status = 'CANCELLED' THEN 'CANCELLED'
        ELSE status
    END
    WHERE ticket_id = p_ticket_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'ticket_id', v_updated_ticket.id,
        'ticket_number', v_updated_ticket.ticket_number,
        'status', v_updated_ticket.status,
        'started_at', v_updated_ticket.started_at,
        'ready_at', v_updated_ticket.ready_at,
        'archived_at', v_updated_ticket.archived_at,
        'cancelled_at', v_updated_ticket.cancelled_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. INTEGRACIÓN ATÓMICA DE KDS EN LA TRANSACCIÓN DE VENTA (execute_sale_checkout)
CREATE OR REPLACE FUNCTION public.execute_sale_checkout(
    p_org_id UUID,
    p_branch_id UUID,
    p_cash_session_id UUID,
    p_user_id UUID,
    p_items JSONB, -- Array de objetos [{ product_id, quantity, unit_price, notes }]
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

    -- Variables para comanda KDS
    v_default_station_id UUID;
    v_ticket_id UUID;
    v_next_ticket_number BIGINT;
    v_ticket_created BOOLEAN := FALSE;
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

    -- 10. GENERACIÓN ATÓMICA DE COMANDA KDS (OPCIÓN A: INDIVISIBILIDAD VENTA -> KDS)
    -- Obtener estación predeterminada de la sucursal (ej. 'BAR' o primera estación activa)
    SELECT id INTO v_default_station_id
    FROM public.kitchen_stations
    WHERE branch_id = p_branch_id
      AND is_active = TRUE
    ORDER BY created_at ASC
    LIMIT 1;

    -- Si no existe estación, crear una predeterminada para evitar caída de comanda
    IF v_default_station_id IS NULL THEN
        INSERT INTO public.kitchen_stations (organization_id, branch_id, name, code)
        VALUES (p_org_id, p_branch_id, 'Barra / Cafetería', 'BAR')
        RETURNING id INTO v_default_station_id;
    END IF;

    -- Secuencial atómico de ticket para la sucursal
    SELECT COALESCE(MAX(ticket_number), 0) + 1 INTO v_next_ticket_number
    FROM public.kitchen_tickets
    WHERE branch_id = p_branch_id;

    -- Insertar cabecera de comanda en estado 'NEW'
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

    -- Insertar líneas operativas en kitchen_ticket_items
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

    v_ticket_created := TRUE;

    -- 11. Retornar comprobante estructurado con datos de venta y KDS
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
        'kitchen_ticket', jsonb_build_object(
            'ticket_id', v_ticket_id,
            'ticket_number', v_next_ticket_number,
            'station_id', v_default_station_id,
            'status', 'NEW'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
