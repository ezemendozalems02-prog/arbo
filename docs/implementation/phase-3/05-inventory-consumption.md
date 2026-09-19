# ARBO OS — FASE 3: CONSUMO DE INVENTARIO POR EXPLOSIÓN DE RECETAS

---

## 1. MECANISMO DE EXPLOSIÓN EN LÍNEA

Al cobrar una venta, cada ítem comercial es evaluado contra las tablas `recipes` y `recipe_items`.

### Fórmula de Consumo por Ingrediente:
$$\text{Consumo} = \text{Cantidad Vendida} \times \left( \frac{\text{Cantidad Receta en Unidad Base}}{\text{Rendimiento de Receta}} \right) \times \left( \frac{1}{1 - \frac{\text{Merma \%}}{100}} \right)$$

### Registro en el Libro Mayor:
Para cada ingrediente involucrado, se inserta una fila en `inventory_movements`:
- `movement_type`: `'SALE_DEPLETION'`
- `quantity_delta`: Valor negativo ($-\text{Consumo}$)
- `unit_cost_snapshot`: Costo unitario actual del ingrediente (determinado por PPP previo)
- `reference_id`: UUID de la venta (`sales.id`)
- `reason`: `"Consumo por venta #<sale_number>"`

---

## 2. CASO DE REFERENCIA OBLIGATORIO: ESPRESSO DOBLE

- **Insumo:** Café Grano (Unidad base: `kg`, Costo: `$15.000,00 ARS/kg`, Stock Inicial: `5.000 kg`)
- **Producto:** Espresso Doble (PVP: `$3.500,00 ARS`)
- **Receta:** 18 g de Café Grano por porción
  - Conversión a base: $18\text{ g} \times 0.001\text{ kg/g} = 0.018\text{ kg}$
  - Merma: $0\%$
  - Rendimiento: 1 porción
- **Venta de 1 unidad:**
  $$\text{Delta} = -0.018\text{ kg}$$
  $$\text{Stock Final} = 5.000\text{ kg} + (-0.018\text{ kg}) = \mathbf{4.982\text{ kg}}$$
- **Venta de 2 unidades:**
  $$\text{Delta} = -0.036\text{ kg}$$
- **Venta de 50 unidades:**
  $$\text{Delta} = 50 \times (-0.018\text{ kg}) = -0.900\text{ kg}$$

El stock físico remanente se mantiene siempre como la suma directa de todos los deltas del ledger, sin recurrir a columnas de stock mutables.
