# ARBO OS — FASE 5: VISTA UNIFICADA CUSTOMER 360
## IDENTIDAD, HISTORIAL, FAVORITOS Y FIDELIZACIÓN DERIVADOS

---

## 1. PRINCIPIO DE NO DUPLICACIÓN DE DATOS

ARBO OS **no crea tablas intermedias redundantes** (como `customer_stats` o `customer_favorites`) que se actualicen por triggers o batches y puedan quedar desfasadas frente a ventas anuladas o ajustes de caja.

Toda la información del perfil **Customer 360** se deriva dinámicamente desde las fuentes de verdad transaccionales:
- `customers` (Identidad y perfil base).
- `sales` (Historial de transacciones y estados `PAID`).
- `sale_items` (Consumo detallado de productos y cantidades).
- `loyalty_transactions` (Libro mayor de puntos).

---

## 2. ESTRUCTURA DEL PAYLOAD CUSTOMER 360

La función `buildCustomer360(customerId, state)` consolida los siguientes dominios:

```json
{
  "customer": {
    "id": "cust_12345",
    "organization_id": "org_trevelin_demo",
    "full_name": "Cliente Demo",
    "phone": "+5493410000000",
    "email": "demo@arboclub.com",
    "status": "ACTIVE",
    "created_at": "2026-09-19T00:00:00.000Z"
  },
  "loyalty": {
    "current_balance": 70,
    "transactions_count": 3,
    "history": [
      { "type": "EARN", "delta": 70, "ref": "SALE" },
      { "type": "REDEEM", "delta": -35, "ref": "REDEMPTION" },
      { "type": "EARN", "delta": 35, "ref": "SALE" }
    ]
  },
  "rfm": {
    "recency_days": 0,
    "last_purchase_date": "2026-09-19T04:55:00.000Z",
    "frequency": 2,
    "monetary": 10500.00,
    "average_ticket": 5250.00,
    "segment": "NEW_CUSTOMER"
  },
  "favorites": {
    "top_favorite": {
      "product_id": "prod_espresso_01",
      "product_name": "Espresso Doble",
      "total_quantity": 3,
      "total_spent": 10500.00,
      "times_ordered": 2
    },
    "all_favorites": [...]
  }
}
```

---

## 3. ALGORITMO DE PRODUCTOS FAVORITOS

1. Se seleccionan únicamente las ventas con estado `PAID` asociadas al `customer_id`.
2. Se extraen todas las líneas de venta (`sale_items`) correspondientes.
3. Se agrupan por `product_id`.
4. Se calcula:
   - Cantidad total acumulada (`SUM(quantity)`).
   - Gasto total acumulado (`SUM(subtotal)`).
   - Frecuencia de pedido (`COUNT(*)`).
5. Se ordenan de forma determinista por: `total_quantity DESC, total_spent DESC`.
