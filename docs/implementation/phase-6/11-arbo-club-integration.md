# ARBO OS — FASE 6: ARBO CLUB & FIDELIZACIÓN EN PEDIDOS ONLINE
## ACREDITACIÓN DE PUNTOS & IDEMPOTENCIA EN EL LEDGER

---

## 1. REGLA DE PUNTOS: `floor(total / 100)`

Toda orden pública confirmada y pagada acumula puntos bajo la fórmula estándar:

$$\text{Puntos} = \left\lfloor \frac{\text{Total}}{100} \right\rfloor$$

### Ejemplo:
- Pedido online de **$5.300,00 ARS** (1 Espresso Doble + 1 Medialuna) $\rightarrow$ $\lfloor 5300 / 100 \rfloor = \mathbf{53\text{ puntos}}$.
- Se inserta un registro en `loyalty_transactions`:
  - `transaction_type`: `EARN`
  - `points_delta`: `+53`
  - `reference_type`: `SALE`
  - `reference_id`: `sale_id` correspondiente.

---

## 2. IDEMPOTENCIA EN EL LIBRO MAYOR

El índice de unicidad `uq_loyalty_tx_sale_earn` sobre `(reference_type, reference_id, transaction_type)` garantiza que si una orden pública sufre reintentos de procesamiento o refrescos de pantalla, **NUNCA** se generará un segundo movimiento de acreditación (nunca `+53` y `+53`).
