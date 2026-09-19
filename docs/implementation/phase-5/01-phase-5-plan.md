# ARBO OS — FASE 5: PLAN DE IMPLEMENTACIÓN
## ARBO CLUB + CRM + CUSTOMER 360

---

## 1. OBJETIVO DE LA FASE

Construir la capa de fidelización y relacionamiento con clientes (ARBO Club + CRM + Customer 360) unificada a nivel organización, con un libro mayor de puntos (*Loyalty Ledger*) estrictamente *append-only*, integrado de forma atómica y ACID en la transacción de checkout de ventas existente, preservando la compatibilidad absoluta con ventas anónimas y sin duplicar fuentes de verdad transaccionales.

---

## 2. COMPONENTES Y ALCANCE

1. **Entidad Customer (Organization-Level)**:
   - Identidad de baja fricción basada en teléfono normalizado (`UNIQUE(organization_id, phone)`).
   - Tenancy por organización (`organization_id`), permitiendo que múltiples sucursales (Branch A, B, C) compartan el mismo cliente y su saldo unificado.
2. **Loyalty Ledger (Append-Only)**:
   - Tabla `loyalty_transactions` sin columnas mutables de saldo. El saldo es una proyección sumatoria de deltas (`SUM(points_delta)`).
   - Movimientos: `EARN`, `REDEEM`, `ADJUSTMENT`, `REFUND`, `EXPIRE`.
3. **Fórmula de Acreditación**:
   - `floor(total / 100)`: división entera hacia abajo ($3.500 $\rightarrow$ 35 pts; $3.999 $\rightarrow$ 39 pts; $99 $\rightarrow$ 0 pts).
4. **Integración Transaccional ACID con Checkout**:
   - Inclusión en `execute_sale_checkout(...)`: SALE + PAYMENT + INVENTORY + CASH + KDS + LOYALTY EARN en un solo bloque indivisible.
   - Rollback estricto si la acreditación falla o el cliente es inválido.
5. **Idempotencia**:
   - Constraint de unicidad sobre `(reference_type, reference_id, transaction_type)` para evitar doble acreditación por reintentos de cobro.
6. **Catálogo de Recompensas & Redención**:
   - Tablas `rewards` y `reward_redemptions`.
   - RPC `execute_reward_redemption(...)` atómica que bloquea saldos negativos y registra `-points_spent` en el ledger como `REDEEM`.
7. **Customer 360 & RFM**:
   - Métrica en tiempo real derivada de `sales` y `sale_items` sin almacenamiento duplicado.
   - Recencia, Frecuencia, Gasto Monetario, Ticket Promedio y Productos Favoritos.
8. **Seguridad y Privacidad (RLS)**:
   - Aislamiento multi-tenant estricto sobre `customers`, `loyalty_transactions`, `rewards`, `reward_redemptions`. PII protegida.

---

## 3. LÍMITES ESTRICTOS (OUT OF SCOPE)

- NO online ordering ni web pública de clientes.
- NO reservas ni gestión de mesas avanzada.
- NO delivery ni ruteo de despachos.
- NO fiscalidad AFIP/ARCA.
- NO marketing automation ni campañas salientes por WhatsApp API.
- NO hardware de impresión física.
- NO avance automático a Fase 6.
