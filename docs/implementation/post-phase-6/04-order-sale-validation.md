# ARBO OS — POST-PHASE 6 CHECKPOINT
## 04. VALIDACIÓN TRANSACCIONAL: PUBLIC ORDER → SALE
## FRONTERA ACID Y ATOMICIDAD INDIVISIBLE

---

## 1. LOCALIZACIÓN DE LA FRONTERA ACID

La conversión de una orden pública a una venta operativa ocurre a través de:
```
confirmPublicOrderToSale(...) -> executeSaleCheckoutAtomic(...)
```

No existen sentencias `INSERT INTO sales` o `INSERT INTO inventory_movements` desarticuladas o independientes en el código de la web pública.

### Garantías Certificadas:
1. **Verificación Previa**:
   - Se valida que la orden pública esté en estado `PENDING`.
   - Se verifica que exista una sesión de caja abierta (`status: OPEN`) en la sucursal receptora.
   - Se validan las recetas y la suficiencia de stock físico de cada insumo.
2. **Ejecución Atómica**:
   - En una sola transacción se generan:
     - `sales` (con `customer_id` y `sale_number`).
     - `sale_items` (con snapshots congelados de producto y precio).
     - `payments` (con método de pago e importe exacto).
     - `cash_movements` (asentando el ingreso en el libro mayor de caja).
     - `inventory_movements` (delta negativo de descarga por receta).
     - `kitchen_tickets` (comanda KDS en estado `NEW`).
     - `loyalty_transactions` (crédito de puntos `EARN` en ARBO Club).
3. **Rollback Verificado**:
   - Si la orden contiene un producto sin insumos suficientes o la caja fue cerrada, la función lanza una excepción y **ningún registro huérfano** es persistido en base de datos.
   - La orden pública no pasa a `CONFIRMED` si la venta no se materializó.
