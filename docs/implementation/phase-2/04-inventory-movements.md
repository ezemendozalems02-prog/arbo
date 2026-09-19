# ARBO OS — FASE 2: LIBRO MAYOR DE MOVIMIENTOS DE INVENTARIO

---

## 1. PRINCIPIO DE INMUTABILIDAD (APPEND-ONLY LEDGER)

En ARBO OS, el inventario no se almacena como una simple columna mutable `stock = 123` en una tabla de insumos o productos. En su lugar, se implementa un **libro mayor append-only** mediante la tabla `inventory_movements`.

Cualquier cambio físico en las existencias se registra como un evento auditable e inmutable.

### Ventajas Arquitectónicas:
1. **Auditoría completa:** Cada gramo consumido o ingresado tiene timestamp, usuario autor, tipo de movimiento y documento de referencia.
2. **Reconstrucción temporal:** Permite calcular el stock a cualquier punto en el tiempo histórico.
3. **Resistencia a condiciones de carrera:** Las transacciones no sobrescriben un valor escalar, sino que insertan un delta con signo y valorización.

---

## 2. TAXONOMÍA DE MOVIMIENTOS

| Tipo de Movimiento | Signo del Delta | Propósito | Impacto en PPP |
| :--- | :---: | :--- | :---: |
| `INITIAL_STOCK` | Positivo (+) | Carga de inventario de arranque o balance inicial | Sí (establece PPP inicial) |
| `PURCHASE_RECEIPT` | Positivo (+) | Recepción de remito / factura de compra a proveedor | Sí (recalcula PPP ponderado) |
| `ADJUSTMENT_IN` | Positivo (+) | Ajuste positivo de auditoría física o sobrante | No altera costo promedio |
| `SALE_DEPLETION` | Negativo (-) | Baja automática por venta (explosión de receta) | No altera costo promedio |
| `WASTE` | Negativo (-) | Merma operativa, vencimiento, descarte | No altera costo promedio |
| `ADJUSTMENT_OUT` | Negativo (-) | Ajuste negativo de auditoría física o faltante | No altera costo promedio |

---

## 3. CÁLCULO DE STOCK DISPONIBLE

El stock actual de un ingrediente en una sucursal dada se obtiene sumando los deltas normalizados a la unidad base del insumo:

$$\text{Stock Actual} = \sum_{m \in \text{Movements}} \text{convertUnit}(m.\text{quantity}, m.\text{unit}, \text{base\_unit})$$

En PostgreSQL, la migración provee la función determinística:
```sql
get_current_stock(p_ingredient_id UUID, p_branch_id UUID) RETURNS NUMERIC
```
Y en el dominio JavaScript:
```javascript
import { calculateCurrentStock } from '@/services/domain/inventoryCosting.js';
const currentStock = calculateCurrentStock(movements, ingredientBaseUnit);
```

---

## 4. PREPARACIÓN PARA FASE 3 (VENTAS Y POS)

El servicio `calculateRecipeDepletion(recipe, portionsSold)` produce la lista exacta de movimientos requeridos con tipo `SALE_DEPLETION` y signo negativo, listos para ser insertados atómicamente dentro de la transacción de cobro o despacho del pedido en la Fase 3, sin requerir cambios de esquema.
