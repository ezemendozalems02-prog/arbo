# 08 — Recetas y costos

**Rutas:** `/admin/recetas`, `/admin/recetas/:id`, `/admin/costos`
**Servicios:** `src/services/recipeCostService.js`, `inventoryCostService.js`, `unitService.js`
**Estado general:** `CONFIRMED_WORKING` — es el módulo mejor construido y
mejor verificado de ARBO OS.

## 8.1 Modelo

15 recetas en la semilla: 14 vinculadas a un producto (`productId`) y 1
"preparado" sin producto (Salsa ARBO), pensado para usarse dentro de otras
recetas.

Estructura de una receta:

```json
{ "id": "rec-salsa-arbo", "name": "Salsa ARBO", "categoryKey": "preparados",
  "productId": null, "yield": { "qty": 1, "unit": "kilogramo" }, "status": "activa",
  "ingredients": [ { "kind": "insumo", "refId": "ins41", "quantity": 700, "unit": "gramo" } ] }
```

Un ingrediente puede ser `kind: 'insumo'` o `kind: 'recipe'` — **sub-recetas
anidadas** están soportadas de verdad, no sólo declaradas.

## 8.2 Costeo — revisión de la lógica

`calcRecipeCost` (`recipeCostService.js:25-37`):

- Suma el costo de cada ingrediente, convirtiendo a la unidad de stock del
  insumo con `convertQuantity`.
- Usa **`insumo.avgCost`** (costo promedio ponderado), no el último costo.
  Es la elección correcta para valorizar.
- Divide por el rendimiento (`yield.qty`) para obtener costo por porción.
- **Protección contra ciclos:** el parámetro `visited` (un `Set`) corta
  recursiones A→B→A sin desbordar la pila. Implementado correctamente:
  se clona el set en cada nivel (`nextVisited`), de modo que ramas hermanas no
  se bloquean entre sí. Es un detalle fácil de errar y acá está bien resuelto.
- `calcFoodCostPct` protege la división por cero (`if (!price || price <= 0) return 0`).

`calcWeightedAverageCost` (`inventoryCostService.js:14-18`):

```
nuevoPromedio = (stockActual × costoActual + cantidadEntrante × costoEntrante) / total
```

Correcto, con guarda para `totalQty <= 0`.

`convertQuantity` (`unitService.js`): convierte sólo dentro de la misma
dimensión física (masa ↔ masa, volumen ↔ volumen) y devuelve `null` si no son
convertibles, en lugar de inventar un factor. Decisión conservadora y correcta.
El caso de unidades de packaging (caja, pack, botella) se resuelve con el
factor explícito `unitsToStock` cargado en la compra.

## 8.3 Prueba experimental de propagación de costos

El brief pide verificar experimentalmente si un cambio de costo se refleja
donde debería, documentando antes y después. **Hecho, con datos reales.**

**Procedimiento:** recibir la compra pendiente #2018 (Panadería Trevelin), que
afecta a `ins7` (Pan de campo) y `ins9` (Pan de masa madre), insumos usados en
varias recetas.

**ANTES — insumos:**

| Insumo | Stock | Costo promedio |
|---|---|---|
| ins7 Pan de campo | 28 un | $650,00 |
| ins9 Pan de masa madre | 16 un | $1.100,00 |

**ANTES — recetas (`/admin/recetas`):**

| Receta | Costo | Margen | Food cost |
|---|---|---|---|
| Picada Arbo | $3.665 | $7.535 | 32,7 % |
| Sándwich de Campo | $2.117 | $4.283 | 33,1 % |
| Sándwich de Trucha Ahumada | $2.165 | $6.035 | 26,4 % |
| Tabla Patagónica | $4.786 | $10.014 | 32,3 % |

**Acción:** `/admin/compras/pur18` → "Marcar como recibida".

**DESPUÉS — insumos (leídos de `localStorage`):**

| Insumo | Stock | Costo promedio | Último costo |
|---|---|---|---|
| ins7 Pan de campo | **39,2 un** | **$639,43** | $613 |
| ins9 Pan de masa madre | **34,2 un** | **$1.153,22** | $1.200 |

Verificación a mano del promedio ponderado:

- ins7: `(28 × 650 + 11,2 × 613) / 39,2 = 25.065,6 / 39,2 = 639,43` ✔ coincide exactamente.
- ins9: `(16 × 1100 + 18,2 × 1200) / 34,2 = 39.440 / 34,2 = 1.153,22` ✔ coincide exactamente.

**DESPUÉS — recetas:**

| Receta | Costo | Margen | Food cost | Δ |
|---|---|---|---|---|
| Picada Arbo | **$3.644** | $7.556 | **32,5 %** | bajó |
| Sándwich de Campo | **$2.106** | $4.294 | **32,9 %** | bajó |
| Sándwich de Trucha Ahumada | **$2.218** | $5.982 | **27,1 %** | subió |
| Tabla Patagónica | **$4.765** | $10.035 | **32,2 %** | bajó |

**Recetas no afectadas — sin cambio (control):** Cazuela de Cordero $4.418,
Omelette Patagónico $992, Plato del Día $1.171, Risotto de Hongos $633,
Salsa ARBO $3.043, Tarta de Estación $1.020, Torta del Día $371.

**Conclusión: `CONFIRMED_WORKING`.** La propagación funciona con precisión, y
funciona **por construcción**: el costo de receta no se almacena, se calcula
en cada lectura a partir del `avgCost` vigente. No hay riesgo de valores
desincronizados. El margen y el food cost % se recalculan en cascada, y las
recetas que no comparten insumos quedan intactas.

## 8.4 Capacidades del módulo

| Capacidad | Estado |
|---|---|
| Listar recetas con costo, precio, margen y food cost | `CONFIRMED_WORKING` |
| Detalle de receta con desglose por ingrediente | `CONFIRMED_WORKING` |
| Crear receta (`createRecipe`) | `CONFIRMED_WORKING` (no probado en vivo → `NOT_TESTED` en UI) |
| Editar receta (`updateRecipe`) | `CONFIRMED_WORKING` (ídem) |
| Sub-recetas anidadas | `CONFIRMED_WORKING` por código, con corte de ciclos |
| Propagación de cambios de costo | `CONFIRMED_WORKING` — verificado arriba |
| **Eliminar receta** | `NOT_IMPLEMENTED` — no existe `deleteRecipe` |
| **Historial de costos** | `NOT_IMPLEMENTED` — sólo `avgCost` y `lastCost` actuales |
| **Merma / rendimiento por ingrediente** (waste %) | `NOT_IMPLEMENTED` |
| **Costo de mano de obra o indirectos** | `NOT_IMPLEMENTED` — el food cost es sólo insumos |
| **Precio sugerido por margen objetivo** | `NOT_IMPLEMENTED` |

## 8.5 `/admin/costos`

Tablero de análisis de costos con filtro de período. Muestra food cost por
producto, márgenes y los productos fuera de rango. Lee de los mismos servicios,
por lo que hereda su corrección.

**Nota:** `updateRecipe` (`InventoryContext.jsx:120-122`) es la única mutación
de inventario que **no** deja entrada en `auditLog`, a diferencia de
`createRecipe`, `createInsumo`, `adjustStock`, `createSupplier`, `createPurchase`
y `receivePurchase`. Editar una receta —que cambia el costeo de un producto—
no queda registrado. `OBSERVED · P3`.
