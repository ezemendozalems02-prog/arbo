# ARBO OS — PRE-ARBO CLUB CHECKPOINT: REVISIÓN DE LA TRANSACCIÓN CENTRAL

---

## 1. EVALUACIÓN DE LA TRANSACCIÓN ACID

La función PostgreSQL `public.execute_sale_checkout(...)` consolida atómicamente:
1. `sales` (Cabecera de venta con número secuencial por sucursal y total verificado).
2. `sale_items` (Líneas con snapshots inmutables de precio y nombre).
3. `payments` (Registro del pago en efectivo `CASH`).
4. `inventory_movements` (Salidas por explosión de receta `SALE_DEPLETION` en unidad base).
5. `cash_movements` (Ingreso auditado a la sesión de caja activa `SALE`).
6. `kitchen_tickets` + `kitchen_ticket_items` (Comanda KDS en estado `NEW` con estación asignada).

### ¿Existe riesgo de venta cobrada sin comanda, caja o inventario?
**Respuesta:** **NO**.  
Todas las inserciones ocurren dentro del mismo bloque de transacción PostgreSQL. Si falla la validación de caja, el stock disponible, la concordancia de pago o la creación de la comanda KDS, el motor emite `RAISE EXCEPTION` y revierte **el 100% de los cambios**.

---

## 2. REQUERIMIENTOS PARA LA INTEGRACIÓN DE FASE 5 (ARBO CLUB)

Para que el programa de fidelización se integre de forma transaccional perfecta:
1. La cabecera `sales` debe admitir un campo opcional `customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL`.
2. Dentro de `execute_sale_checkout(...)`, si se proporciona un `p_customer_id`:
   - Se validará que el cliente pertenezca a la misma `organization_id`.
   - Se calcularán los puntos ganados: $\text{puntos} = \lfloor \frac{\text{total}}{100} \rfloor$.
   - Se insertará un movimiento en `loyalty_transactions` con `movement_type = 'EARN_SALE'` y `reference_id = v_sale_id`.
3. **Garantía ACID:** De esta forma, si la venta se confirma, los puntos se acreditan; si la venta falla, los puntos jamás se acreditan, eliminando el riesgo de discrepancias de saldo.
