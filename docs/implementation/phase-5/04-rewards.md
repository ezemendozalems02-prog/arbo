# ARBO OS — FASE 5: CATÁLOGO DE RECOMPENSAS & CANJES
## REDENCIÓN ATÓMICA DE PUNTOS ARBO CLUB

---

## 1. MODELO DE DATOS DE RECOMPENSAS

El módulo de recompensas permite a cada organización definir beneficios canjeables por puntos.

### Tabla `rewards`
```sql
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### Tabla `reward_redemptions`
```sql
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
    points_spent INTEGER NOT NULL CHECK (points_spent > 0),
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

---

## 2. PROCEDIMIENTO ATÓMICO DE REDENCIÓN (`execute_reward_redemption`)

La redención de puntos debe ser absolutamente atómica y a prueba de carreras de condición (concurrencia). Se ejecuta en PostgreSQL mediante la función RPC:

```sql
CREATE OR REPLACE FUNCTION public.execute_reward_redemption(
    p_organization_id UUID,
    p_branch_id UUID,
    p_customer_id UUID,
    p_reward_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_customer_status TEXT;
    v_reward_cost INTEGER;
    v_reward_active BOOLEAN;
    v_current_balance INTEGER;
    v_redemption_id UUID;
BEGIN
    -- 1. Bloqueo de fila del cliente para prevenir carreras concurrentes
    SELECT status INTO v_customer_status
    FROM public.customers
    WHERE id = p_customer_id AND organization_id = p_organization_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'CUSTOMER_NOT_FOUND: Cliente no encontrado en la organizacion.';
    END IF;

    IF v_customer_status <> 'ACTIVE' THEN
        RAISE EXCEPTION 'CUSTOMER_INACTIVE: El cliente no se encuentra activo.';
    END IF;

    -- 2. Validar recompensa
    SELECT points_required, is_active INTO v_reward_cost, v_reward_active
    FROM public.rewards
    WHERE id = p_reward_id AND organization_id = p_organization_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'REWARD_NOT_FOUND: Recompensa no encontrada en la organizacion.';
    END IF;

    IF NOT v_reward_active THEN
        RAISE EXCEPTION 'REWARD_INACTIVE: La recompensa solicitada no esta activa.';
    END IF;

    -- 3. Calcular saldo actual desde el ledger append-only
    SELECT COALESCE(SUM(points_delta), 0) INTO v_current_balance
    FROM public.loyalty_transactions
    WHERE customer_id = p_customer_id;

    IF v_current_balance < v_reward_cost THEN
        RAISE EXCEPTION 'INSUFFICIENT_POINTS: Saldo insuficiente (%) para canjear recompensa (requiere %).',
            v_current_balance, v_reward_cost;
    END IF;

    -- 4. Registrar la redención
    v_redemption_id := gen_random_uuid();

    INSERT INTO public.reward_redemptions (
        id, organization_id, branch_id, customer_id, reward_id,
        points_spent, status, notes, created_by, created_at
    ) VALUES (
        v_redemption_id, p_organization_id, p_branch_id, p_customer_id, p_reward_id,
        v_reward_cost, 'COMPLETED', p_notes, p_user_id, timezone('utc'::text, now())
    );

    -- 5. Registrar el movimiento REDEEM en el Loyalty Ledger
    INSERT INTO public.loyalty_transactions (
        id, organization_id, customer_id, branch_id, points_delta,
        transaction_type, reference_type, reference_id, notes, created_at
    ) VALUES (
        gen_random_uuid(), p_organization_id, p_customer_id, p_branch_id, -v_reward_cost,
        'REDEEM', 'REDEMPTION', v_redemption_id::text, p_notes, timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'redemption_id', v_redemption_id,
        'points_spent', v_reward_cost,
        'remaining_balance', v_current_balance - v_reward_cost
    );
END;
$$;
```

---

## 3. GARANTÍAS DE SEGURIDAD

1. **Prevención de Saldo Negativo**: Si el cliente posee 35 puntos y canjea una recompensa de 35 puntos, su saldo queda en 0. Un segundo intento de canje simultáneo o inmediato es abortado con la excepción `INSUFFICIENT_POINTS`.
2. **Atomicidad**: La inserción en `reward_redemptions` y el débito `-points_spent` en `loyalty_transactions` ocurren en la misma transacción indivisible.
