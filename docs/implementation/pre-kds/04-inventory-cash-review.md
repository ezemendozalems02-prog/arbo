# ARBO OS — PRE-KDS TECHNICAL CHECKPOINT: REVISIÓN DE INVENTARIO Y CAJA

---

## 1. AUDITORÍA DE FUENTE ÚNICA DE VERDAD EN INVENTARIO

Se auditó el código completo para confirmar que no existan fuentes de verdad paralelas para el stock físico:

1. **Ausencia de Columnas Mutables:**
   - La tabla `products` no posee columna `stock` (solo la bandera booleana `track_stock`).
   - La tabla `ingredients` no posee columna mutable `stock` (solo el umbral de alerta `min_stock_alert`).
2. **Cálculo Determinístico:**
   - Todo stock físico se deriva exclusivamente de la función SQL `get_current_stock()` o del agregador de dominio `aggregateStockFromMovements()`.
3. **Inmutabilidad del Ledger:**
   - No se detectaron sentencias `UPDATE` ni `DELETE` sobre `inventory_movements`.
   - Las bajas por venta se registran siempre con `movement_type = 'SALE_DEPLETION'` y delta negativo.

---

## 2. AUDITORÍA DE FUENTE ÚNICA DE VERDAD EN CAJA

Se analizó la consistencia entre saldos teóricos y movimientos físicos:

1. **Preservación Histórica:**
   - La apertura de una nueva sesión (`openCashSession` y `openCashRegister`) crea un nuevo registro en `cash_sessions` y un movimiento `OPENING` sin sobrescribir ni vaciar el historial de turnos o movimientos anteriores.
2. **Saldo Teórico vs Declarado:**
   - El saldo esperado en el cajón físico se calcula sumando exclusivamente los movimientos del turno (`OPENING` + `SALE` + `ADJUSTMENT_IN` - `REFUND` - `ADJUSTMENT_OUT`).
   - En el cierre (`closeCashSession`), se almacena de forma inalterable el monto declarado por el cajero, el esperado por el sistema y la diferencia resultante.
3. **Desacoplamiento Financiero:**
   - Las ventas cobradas con método `'CASH'` generan automáticamente su contrapartida en `cash_movements` con tipo `'SALE'`.

---

## 3. AUDITORÍA DE SNAPSHOTS HISTÓRICOS

En `sale_items`, se verificó que cada registro almacena:
- `product_name_snapshot`
- `unit_price_snapshot`
- `quantity`
- `subtotal`

**Resultado del Test:**
Tras modificar el precio de un producto en el catálogo activo (ej. de $3.500 a $4.500), las ventas históricas mantuvieron sus valores intactos a nivel de línea y cabecera (`$3.500,00 ARS`).
