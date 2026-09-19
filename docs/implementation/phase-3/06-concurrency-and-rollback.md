# ARBO OS — FASE 3: CONCURRENCIA, POLÍTICA DE STOCK Y ROLLBACK

---

## 1. CONTROL DE CONCURRENCIA (SERIALIZACIÓN DE INSUMOS)

Cuando múltiples terminales de mozo o cajas cobran ventas simultáneamente que consumen el mismo insumo crítico (ej. Café Grano o botellas de vino), existe el riesgo de condición de carrera (*race condition*).

### Solución en PostgreSQL:
Dentro de la función transaccional `execute_sale_checkout(...)`, antes de leer el stock y calcular el delta, se ejecuta un bloqueo pesimista a nivel de fila:
```sql
PERFORM id FROM public.ingredients
WHERE id = v_recipe_item.ingredient_id
FOR UPDATE;
```
Esto garantiza que:
1. Las transacciones simultáneas se encolan ordenadamente.
2. Cada transacción lee el stock inmediatamente actualizado por el commit anterior.
3. No es posible sobrevender un insumo limitado por colisión de lecturas paralelas.

---

## 2. POLÍTICA DE STOCK INSUFICIENTE

De acuerdo con los requerimientos de producto y arquitectura, se implementó la política:
**`STRICT_INVENTORY_CHECK` (Bloqueo Estricto de Operación)**.

Si una venta requiere más insumo del disponible en el libro mayor:
$$\text{Stock Actual} < \text{Cantidad Requerida}$$
La función genera una excepción explícita:
```sql
RAISE EXCEPTION 'INSUFFICIENT_STOCK: Stock insuficiente para % (Disponible: %, Requerido: %)',
    v_recipe_item.ingredient_name, v_curr_stock, v_depletion_qty;
```
**Efecto:**
- La venta es rechazada.
- La transacción completa se revierte (ROLLBACK).
- No se crea venta, no se cobra dinero, no se genera delta negativo y el stock no pasa a valores negativos arbitrarios.

---

## 3. PRUEBAS DE ROLLBACK VALIDADAS

La suite automatizada `scripts/validate_phase3_sales_cash_acid.js` valida 3 escenarios de rollback forzado:

1. **Discrepancia de Importe (`PAYMENT_TOTAL_MISMATCH`):**
   - Venta calculada: $3.500,00 ARS. Pago enviado: $2.000,00 ARS.
   - **Resultado:** Excepción capturada, 0 ventas creadas, 0 deltas de stock, 0 movimientos de caja.
2. **Stock Insuficiente (`INSUFFICIENT_STOCK`):**
   - Stock disponible: 4.982 kg. Pedido: 300 Espressos (5.400 kg requeridos).
   - **Resultado:** Excepción capturada, rollback total, stock permanece intacto en 4.982 kg.
3. **Caja Cerrada (`CASH_SESSION_NOT_OPEN`):**
   - Intento de checkout con sesión inexistente o cerrada.
   - **Resultado:** Excepción capturada, rollback total.
