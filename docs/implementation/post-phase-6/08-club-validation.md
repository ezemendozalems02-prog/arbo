# ARBO OS — POST-PHASE 6 CHECKPOINT
## 08. VALIDACIÓN DE FIDELIZACIÓN ARBO CLUB EN COMMERCE PÚBLICO

---

## 1. REGLA OFICIAL DE ACREDITACIÓN: `floor(total / 100)`

Se auditó que los pedidos online confirmados acrediten puntos en el libro mayor `loyalty_transactions` respetando la regla oficial de truncamiento hacia abajo:
- Pedido de **$5.300,00 ARS** $\rightarrow$ $\lfloor 5300 / 100 \rfloor = \mathbf{53\text{ puntos}}$.
- Movimiento registrado:
  - `transaction_type`: `EARN`
  - `points_delta`: `+53`
  - `reference_type`: `SALE`
  - `reference_id`: `sale_id`

---

## 2. AUDITORÍA DE IDEMPOTENCIA EN PUNTOS

Se verificó el índice de unicidad condicional `uq_loyalty_tx_sale_earn`:
- Ante reintentos del request o doble clic, el ledger impide de forma determinista la inserción de un segundo movimiento `EARN` con el mismo `reference_id`.
- Se verificó que el cliente recibe exactamente 53 puntos, nunca `+53` y `+53`.
