# ARBO OS — FASE 6: IDEMPOTENCIA & PREVENCIÓN DE PEDIDOS DUPLICADOS
## ESTRATEGIA MULTINIVEL DE IDEMPOTENCIA

---

## 1. MECANISMOS IMPLEMENTADOS

Para proteger el sistema contra dobles clics, pérdidas momentáneas de conexión móvil o refrescos de página, la Fase 6 implementa:

1. **Idempotency Key en `public_orders`**:
   - Cada submit de orden pública incluye una `idempotency_key` (UUID v4 generado en la sesión del carrito).
   - Restricción DDL:
     ```sql
     CONSTRAINT uq_public_orders_org_idempotency UNIQUE(organization_id, idempotency_key)
     ```
2. **Respuesta Determinista en Reintentos**:
   - Si el cliente reenvía la petición con la misma `idempotency_key`, el backend retorna la orden existente sin crear un segundo registro ni duplicar la comanda.
3. **Idempotencia en el Ledger de Puntos**:
   - `uq_loyalty_tx_sale_earn` previene duplicar movimientos de fidelización por reintentos de cobro.
