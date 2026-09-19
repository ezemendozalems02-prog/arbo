# ARBO OS — PRE-ARBO CLUB CHECKPOINT: MOTOR DE PUNTOS Y RECOMPENSAS

---

## 1. PRINCIPIO DE LIBRO MAYOR (APPEND-ONLY LEDGER)

Siguiendo las decisiones arquitectónicas de `IMPLEMENTATION-GATE.md`:
- **Prohibición:** Está prohibido alterar o editar el saldo de puntos "a mano" en una simple columna de cliente mediante `UPDATE customers SET points = points + X`.
- **Solución:** Se implementará la tabla `loyalty_transactions` como un libro mayor append-only inmutable.

### Estructura Recomendada de `loyalty_transactions`:
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `organization_id UUID NOT NULL REFERENCES public.organizations(id)`
- `branch_id UUID NOT NULL REFERENCES public.branches(id)`
- `customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE`
- `transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('EARN_SALE', 'REDEMPTION', 'MANUAL_ADJUSTMENT_IN', 'MANUAL_ADJUSTMENT_OUT', 'REFUND', 'EXPIRATION'))`
- `points_delta INT NOT NULL CHECK (points_delta != 0)`
- `balance_after INT NOT NULL CHECK (balance_after >= 0)`
- `reference_id UUID` (ID de la venta o del canje)
- `notes TEXT`
- `created_by UUID REFERENCES public.user_profiles(id)`
- `created_at TIMESTAMPTZ DEFAULT clock_timestamp()`

---

## 2. REGLA DE ACREDITACIÓN E IDEMPOTENCIA

1. **Conversión Base:**
   $$\text{Puntos} = \lfloor \frac{\text{Monto Venta}}{100} \rfloor$$
   (Ejemplo: Venta de $\$3.500 \rightarrow 35\text{ puntos}$).
2. **Idempotencia:**
   - Restricción de unicidad: `UNIQUE (reference_id, transaction_type)` para evitar doble acumulación ante reintentos de red.
3. **Recompensas y Redenciones:**
   - Tabla `rewards`: Catálogo de beneficios canjeables (ej. "Café Gratis", "15% Descuento"), puntos requeridos y stock de recompensas.
   - Tabla `reward_redemptions`: Registro auditable del canje con generación de delta negativo en `loyalty_transactions`.
