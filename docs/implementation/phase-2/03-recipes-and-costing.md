# ARBO OS — FASE 2: RECETAS, UNIDADES Y COSTEO PPP

**Módulos de Dominio:**
- `src/services/domain/unitConversion.js`
- `src/services/domain/recipeCalculator.js`
- `src/services/domain/inventoryCosting.js`

---

## 1. SISTEMA DE UNIDADES Y CONVERSIONES

ARBO OS implementa un sistema determinístico de normalización de unidades sin redondeos destructivos intermediarios:

| Familia | Unidad Base | Subunidades | Regla de Conversión |
| :--- | :--- | :--- | :--- |
| **Masa** | `kg` | `g` | 1 kg = 1.000 g / 1 g = 0.001 kg |
| **Volumen** | `l` | `ml` | 1 l = 1.000 ml / 1 ml = 0.001 l |
| **Unidad/Conteo** | `u` | `u` | 1 u = 1 u |

Conversiones entre familias incompatibles (ej. `kg` a `ml` sin densidad declarada) levantan un error explícito `Cannot convert between incompatible unit families: mass to volume`.

---

## 2. EXPLOSIÓN DE RECETAS Y FACTOR DE MERMA

Para cada ítem de una receta:
1. **Conversión a Unidad Base:**
   $$\text{qtyBase} = \text{convertUnit}(\text{quantity}, \text{itemUnit}, \text{ingredient.base\_unit})$$
2. **Factor de Merma:**
   Si un ingrediente tiene un factor de desperdicio $w$ ($0 \le w < 100$):
   $$\text{effectiveQty} = \frac{\text{qtyBase}}{1 - \frac{w}{100}}$$
3. **Costo de Línea:**
   $$\text{lineCost} = \text{effectiveQty} \times \text{ingredient.current\_cost}$$
4. **Costo por Porción de Producto:**
   $$\text{costPerPortion} = \frac{\sum \text{lineCost}}{\text{recipe.yield\_portions}}$$

### Métricas Financieras Derivadas:
- **Food Cost %:**
  $$\text{Food Cost \%} = \left(\frac{\text{costPerPortion}}{\text{product.price}}\right) \times 100$$
- **Margen Bruto Unitario:**
  $$\text{grossMargin} = \text{product.price} - \text{costPerPortion}$$
- **Margen Bruto %:**
  $$\text{grossMarginPct} = \left(\frac{\text{grossMargin}}{\text{product.price}}\right) \times 100$$

---

## 3. COSTEO POR PRECIO PROMEDIO PONDERADO (PPP)

Cuando ingresa stock (ej. compras, inventario inicial), el costo unitario del ingrediente se actualiza mediante la fórmula matemática de PPP:

$$\text{Nuevo PPP} = \frac{(\text{Stock Actual} \times \text{Costo Actual}) + (\text{Cantidad Entrante} \times \text{Costo Entrante})}{\text{Stock Actual} + \text{Cantidad Entrante}}$$

### Reglas de Dominio:
- Si el stock actual es $\le 0$, el nuevo PPP toma directamente el costo del lote entrante.
- Las salidas de stock (`SALE_DEPLETION`, `WASTE`, `ADJUSTMENT_OUT`) **no alteran el PPP unitario**, sólo decrementan el stock acumulado y valorizan la baja al PPP vigente.
- Todo cálculo se preserva con precisión `NUMERIC(12, 4)`.

---

## 4. CASO DE REFERENCIA OBLIGATORIO (ESPRESSO DOBLE)

- **Ingrediente:** Café Grano
  - Costo Base: $15.000,00 ARS / kg
  - Stock Inicial: 5.000 kg
- **Receta:** Espresso Doble
  - Consumo: 18 g de Café Grano
  - Merma: 0%
  - Rendimiento: 1 porción
  - Precio de Venta: $3.500,00 ARS
- **Resultados Validados:**
  - Consumo en unidad base: $18 \times 0.001\text{ kg} = 0.018\text{ kg}$
  - Costo por porción: $0.018\text{ kg} \times \$15.000/\text{kg} = \$270.00\text{ ARS}$
  - Food Cost %: $(\$270 / \$3.500) \times 100 = 7.71\%$
  - Margen Bruto: $\$3.500 - \$270 = \$3.230.00\text{ ARS}$ ($92.29\%$)
  - Stock tras 1 porción: $5.000\text{ kg} - 0.018\text{ kg} = 4.982\text{ kg}$
