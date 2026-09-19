# ARBO OS — FASE 6: INTEGRACIÓN CON INVENTARIO & RECETAS
## DESCARGA DE INSUMOS & CONTROL DE CONCURRENCIA

---

## 1. CONSUMO ATÓMICO MEDIANTE RECETAS

La confirmación de pedidos online activa la explosión de recetas de los productos ordenados:
- Se buscan los insumos en `recipes` y `recipe_items`.
- Se aplican conversiones de unidades exactas (`g` a `kg`).
- Se genera un registro `SALE_DEPLETION` en `inventory_movements`.

---

## 2. PREVENCIÓN DE STOCK NEGATIVO (CONCURRENCIA)

Si dos clientes ordenan simultáneamente el último stock disponible:
1. El primer pedido que ingresa al motor transaccional `executeSaleCheckoutAtomic` descuenta los insumos disponibles.
2. El segundo pedido concurrente detecta que el stock calculado desde `inventoryMovements` es inferior al requerido por la receta.
3. El sistema lanza la excepción:
   ```
   INSUFFICIENT_STOCK: Stock insuficiente para Café Grano Especialidad...
   ```
4. Se aborta la segunda orden sin permitir saldos de inventario negativos.
