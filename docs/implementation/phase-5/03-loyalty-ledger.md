# ARBO OS — FASE 5: LIBRO MAYOR DE FIDELIZACIÓN (LOYALTY LEDGER)
## MODELO APPEND-ONLY & DERIVACIÓN DE SALDOS

---

## 1. PRINCIPIO DE DISEÑO: APPEND-ONLY SIN SALDOS MUTABLES

A diferencia de sistemas heredados que almacenan un campo `points_balance` mutable en el cliente (propenso a carreras de condición, desincronizaciones y falta de auditoría), ARBO Club implementa un **Libro Mayor de Fidelización Estrictamente Append-Only** (`loyalty_transactions`).

- **Inmutabilidad**: Ningún registro de transacción de puntos se actualiza o elimina.
- **Derivación de Saldo**: El saldo disponible es una función matemática exacta de las transacciones acumuladas:
  $$\text{Saldo} = \sum \text{points\_delta}$$
- **Trazabilidad Completa**: Cada punto acumulado o deducido tiene referencia exacta a la venta (`SALE`), redención (`REDEMPTION`), ajuste manual (`ADJUSTMENT`) o vencimiento (`EXPIRE`).

---

## 2. ESQUEMA DDL DE LA TABLA `loyalty_transactions`

```sql
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    points_delta INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('EARN', 'REDEEM', 'ADJUSTMENT', 'REFUND', 'EXPIRE')),
    reference_type TEXT CHECK (reference_type IN ('SALE', 'REDEMPTION', 'MANUAL_ADJUSTMENT', 'EXPIRATION')),
    reference_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

---

## 3. REGLA OFICIAL DE ACREDITACIÓN: `floor(total / 100)`

La tasa de conversión de pesos a puntos se calcula como una división entera truncada hacia abajo:

$$\text{Puntos Ganados} = \left\lfloor \frac{\text{Monto Total}}{100} \right\rfloor$$

### Ejemplos Validados:
- Venta de **$3.500,00 ARS** $\rightarrow$ $\lfloor 3500 / 100 \rfloor = \mathbf{35\text{ puntos}}$
- Venta de **$3.999,00 ARS** $\rightarrow$ $\lfloor 3999 / 100 \rfloor = \mathbf{39\text{ puntos}}$ (sin redondeo hacia arriba)
- Venta de **$99,00 ARS** $\rightarrow$ $\lfloor 99 / 100 \rfloor = \mathbf{0\text{ puntos}}$ (umbral mínimo)

---

## 4. TIPOS DE MOVIMIENTO DEL LEDGER

| Tipo (`transaction_type`) | Signo Delta | `reference_type` | Descripción |
| :--- | :---: | :--- | :--- |
| **`EARN`** | Positivo ($>0$) | `SALE` | Acreditación por venta cobrada en checkout |
| **`REDEEM`** | Negativo ($<0$) | `REDEMPTION` | Débito por canje de beneficio o recompensa |
| **`ADJUSTMENT`** | Positivo / Negativo | `MANUAL_ADJUSTMENT` | Corrección auditada por administrador |
| **`REFUND`** | Negativo ($<0$) | `SALE` | Reversión de puntos por anulación de venta |
| **`EXPIRE`** | Negativo ($<0$) | `EXPIRATION` | Caducidad de puntos por inactividad |
