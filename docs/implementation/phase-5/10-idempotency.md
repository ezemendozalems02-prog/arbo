# ARBO OS — FASE 5: IDEMPOTENCIA & PREVENCIÓN DE DUPLICADOS
## INTEGRIDAD EN LA ACREDITACIÓN DE PUNTOS ARBO CLUB

---

## 1. EL RIESGO DE DOBLE ACREDITACIÓN

En un entorno de punto de venta (POS), ante intermitencias de red, doble clic de un cajero o reintentos de pago, existe el riesgo de que una venta exitosa intente acreditar puntos más de una vez, generando inflación artificial del saldo de fidelización.

---

## 2. MECANISMO DE IDEMPOTENCIA IMPLEMENTADO

### En Base de Datos (PostgreSQL DDL)
Se implementa un índice de unicidad condicional sobre el libro mayor de puntos:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_loyalty_tx_sale_earn
ON public.loyalty_transactions (reference_type, reference_id, transaction_type)
WHERE reference_type = 'SALE' AND transaction_type = 'EARN';
```

### En Capa de Dominio JavaScript
Antes de anexar una transacción `EARN`, el motor verifica la existencia previa de un movimiento idéntico:

```javascript
const isDuplicate = loyaltyTransactions.some(
  tx => tx.reference_type === 'SALE' && tx.reference_id === saleId && tx.transaction_type === 'EARN'
)
if (isDuplicate) {
  throw new Error('IDEMPOTENCY_VIOLATION: Ya se han acreditado puntos para esta venta.')
}
```

---

## 3. RESULTADOS DE PRUEBA DE IDEMPOTENCIA

1. Venta de $3.500 asociada a Cliente Demo procesada: Se genera movimiento `+35 EARN`.
2. Reintento simulado con el mismo `sale_id`:
   - El sistema detecta la idempotency key existente.
   - Se rechaza la duplicación.
   - El ledger conserva exactamente 1 registro `+35 EARN` (nunca `+35` y `+35`).
   - Saldo final verificado: 35 puntos.
