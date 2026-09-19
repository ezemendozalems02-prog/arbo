# ARBO OS — PRE-KDS TECHNICAL CHECKPOINT: REVISIÓN DE LA TRANSACCIÓN CENTRAL

---

## 1. ANÁLISIS FORENSE DE `execute_sale_checkout(...)`

Se inspeccionó exhaustivamente la función PL/pgSQL `public.execute_sale_checkout` en `20260919000003_sales_cash_acid.sql`:

### 1.1 ¿Existe alguna ventana de persistencia parcial?
**Respuesta:** **NO**.  
En PostgreSQL, cualquier invocación de función PL/pgSQL opera dentro de una transacción atómica implícita o explícita.
- Si la transacción llega al final del bloque `BEGIN ... END;`, emite un `COMMIT` integral de todas las mutaciones (`sales`, `sale_items`, `payments`, `inventory_movements`, `cash_movements`).
- Si se emite cualquier `RAISE EXCEPTION` en cualquier línea (o si ocurre un corte de red/falla de servidor), el motor aborta y realiza un `ROLLBACK` total de toda la transacción.

### 1.2 ¿Los bloqueos de concurrencia son suficientes?
**Respuesta:** **SÍ**.  
La función ejecuta:
```sql
PERFORM id FROM public.ingredients
WHERE id = v_recipe_item.ingredient_id
FOR UPDATE;
```
Este bloqueo a nivel de fila (`FOR UPDATE`) sobre el ingrediente involucrado serializa las ventas concurrentes que consumen la misma materia prima. La segunda venta queda en espera bloqueante hasta que la primera commitee, garantizando que `get_current_stock()` evalúe el stock exacto resultante de la primera operación.

### 1.3 ¿El cálculo de consumo utiliza las conversiones y mermas correctas?
**Respuesta:** **SÍ**.
- Masa: `g` a `kg` divide por `1000.0000`.
- Volumen: `ml` a `l` divide por `1000.0000`.
- Unidades iguales: factor `1.0`.
- Merma: `v_depletion_qty / (1.0 - (waste_percentage / 100.0))`.
- Unidades incompatibles: genera excepción `INCOMPATIBLE_UNIT` disparando rollback.

### 1.4 ¿La validación de stock ocurre dentro de la misma transacción?
**Respuesta:** **SÍ**.  
Ocurre inmediatamente después del lock pesimista:
```sql
v_curr_stock := public.get_current_stock(p_org_id, p_branch_id, v_recipe_item.ingredient_id);
IF v_curr_stock < v_depletion_qty THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: ...';
END IF;
```

---

## 2. HALLAZGOS Y RIESGOS DOCUMENTADOS

| Código | Riesgo Identificado | Severidad | Mitigación para Fase 4 |
| :--- | :--- | :---: | :--- |
| **R-01** | La función asume que toda venta cobrada se despacha en el acto. En salón (mesas), los platos se comandan a cocina antes del pago. | **P1** | En Fase 4 (KDS), la comanda se originará desde la orden (`orders` / `kitchen_tickets`). El cobro final en caja vinculará la venta a la comanda preexistente sin duplicar el descuento de inventario. |
