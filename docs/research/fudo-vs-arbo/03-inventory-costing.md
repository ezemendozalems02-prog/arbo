# 03 — Stock, Compras, Proveedores, Recetas y Costos

**Categorías cubiertas:**
9. Control de Stock e Inventario
10. Gestión de Compras
11. Directorio de Proveedores
12. Recetas (Fichas Técnicas)
13. Subrecetas
14. Costos y Valorización
15. Food Cost y Margen Bruto
16. Modificadores de Producto y Stock

---

## 9. Control de Stock e Inventario

### FUDO
- **Qué hace:** Sistema de inventario transaccional automatizado con enlace directo al punto de venta.
- **Qué fue documentado (`DOCUMENTED` en Fase 6):**
  - **Descuento de stock en tiempo real:** Al presionar "Confirmar" en una comanda del POS, el sistema descuenta automáticamente los insumos consumidos por receta o producto simple.
  - **Doble criterio de consumo:** Configurable para descontar al enviar a cocina o al cerrar la venta.
  - Historial de movimientos inmutable con tipo de operación (`Venta`, `Compra`, `Merma`, `Ajuste`, `Conteo`).
  - Soporte de stock negativo opcional (permite seguir vendiendo en mostrador aunque el sistema marque cero, ajustando con signo negativo para regularizar luego).
  - Conteo de inventario (inventario físico ciego o visible) con reporte de diferencias y ajuste automático.
- **Limitaciones:**
  - Descuentos de stock irreversibles si una venta se anula fuera de plazo sin proceso de devolución formal.
  - No modela depósitos múltiples por local (no hay "Barra" separada de "Depósito").
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Módulo de inventario aislado con 50 insumos y persistencia en `arbo_inventory_v1`.
- **Qué fue observado (`OBSERVED` en `10-stock.md`):**
  - **EL HALLAZGO CENTRAL (GAP CRÍTICO · P1): La venta NO descuenta stock.** Declarado explícitamente en el código (`InventoryContext.jsx:18-22`):
    > *"las ventas confirmadas en el POS NO descuentan stock automáticamente todavía — el servicio de consumo teórico ya está listo y se usa para MOSTRAR el consumo/costo de una venta (ver VentaDetail), pero conectarlo para mutar stock de verdad queda para cuando la venta viva en Supabase."*
  - Vender 50 platos no descuenta un gramo de carne, harina ni café. El stock solo se mueve por compras manuales, mermas y ajustes.
  - **Operaciones que sí mueven stock:**
    - Recepción de compra (`CONFIRMED_WORKING`): suma stock y actualiza costo ponderado.
    - Inventario físico (`CONFIRMED_WORKING` en `PhysicalInventory.jsx`): compara conteo manual contra sistema y emite ajustes.
    - Mermas (`PARTIAL` con BUG-009): recorta silenciosamente la cantidad al stock actual y puede usar unidades erróneas si no son convertibles.
  - Prevención estricta de negativos: `Math.max(0, ...)` impide stock negativo en toda circunstancia.
- **Estado:** `PARTIAL` (Inventario desconectado de la venta).

### DIFERENCIA COMPROBADA
FUDO descuenta stock automáticamente al vender en el salón o mostrador. En ARBO OS, el enlace venta-stock no está conectado: es un inventario teórico manual.

### IMPLICACIÓN
ARBO OS no permite gestionar reposiciones basadas en la demanda real de ventas del día hasta que no se active el trigger de consumo en base de datos.

---

## 10 & 11. Compras y Proveedores

### FUDO
- **Qué hace:** Módulo de compras con actualización de costos y enlace opcional a cuentas por pagar.
- **Qué fue documentado (`DOCUMENTED` en Fase 6 y art. 11730864):**
  - Carga de órdenes de compra y recepción de mercadería con actualización de costo de compra o costo promedio ponderado.
  - Proveedores con cuenta corriente asociada: una compra puede quedar en estado "impaga" e impactar el saldo deudor del proveedor.
  - Enlace fiscal: permite asociar número de factura/remito del proveedor.
- **Limitaciones:** No emite órdenes de pago complejas con retenciones impositivas de ingresos brutos o ganancias (requiere software contable externo).
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Circuito de carga y recepción de compras sobre 10 proveedores semilla.
- **Qué fue observado (`OBSERVED` en `11-purchases-suppliers.md`):**
  - **Cálculo Matemático de Costo Promedio Ponderado (`CONFIRMED_WORKING`):** `purchaseService.js` implementa `calcWeightedAverageCost` y resuelve unidades de bulto (`caja`, `pack`) mediante el factor `unitsToStock` con precisión.
  - **Sugerencias de reposición (`purchaseSuggestionService.js`):** Detecta insumos bajo mínimo y sugiere la cantidad para alcanzar el stock máximo.
  - **Gaps y Defectos:**
    - Las sugerencias de compra en la UI son informativas (`UI_ONLY`): no permiten generar una orden con un clic.
    - Recibir una compra **no genera movimiento de egreso en Caja** (`/admin/caja`) ni registra deuda comercial.
    - BUG-011: `cancelPurchase` en el contexto carece de validación de estado.
    - BUG-012: Insumos de conteo con cantidades fraccionarias (ej. 11,2 panes).
- **Estado:** `PARTIAL`.

---

## 12 & 13. Recetas (Fichas Técnicas) y Subrecetas

### FUDO
- **Qué hace:** Fichas técnicas de productos con soporte para subrecetas recursivas.
- **Qué fue documentado (`DOCUMENTED` en Fase 6 y art. 11730848):**
  - Definición de recetas con ingredientes, mermas de cocción/limpieza porcentuales y rendimientos.
  - **Subrecetas:** Un producto elaborado (ej. *"Salsa de tomate casera"*) puede ser ingrediente de otra receta (ej. *"Pizza Muzzarella"*), recalculando el costo en cascada.
- **Limitaciones:** En el editor de subrecetas, la documentación advierte inconsistencias de redondeo si las unidades del ingrediente base no coinciden exactamente.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Editor y visualizador de 15 recetas vinculadas a productos de carta (`/admin/recetas`).
- **Qué fue observado (`OBSERVED` en `08-recipes-costs.md`):**
  - `recipeCostService.js` calcula el costo total de la receta sumando el costo promedio de cada ingrediente:
    $$\text{CostoReceta} = \sum (\text{insumo.cantidad} \times \text{insumo.avgCost})$$
  - Soporte de subrecetas contemplado en código (`calcRecipeSummary` acepta `getRecipe` para resolver ingredientes tipo receta), aunque en los datos semilla solo existen recetas de un nivel.
  - Vinculación limpia: `recipe.productId` asocia la ficha técnica al ítem comercial.
- **Estado:** `CONFIRMED_WORKING`.

---

## 14 & 15. Costos, Food Cost y Rentabilidad

### FUDO
- **Qué hace:** Cálculo de costo teórico, margen de contribución y reporte de P&L (Estado de Resultados).
- **Qué fue documentado (`DOCUMENTED` en Fase 12 y addendum P&L):**
  - Margen bruto por producto: `Precio de venta - Costo de receta`.
  - Food Cost porcentual por categoría y por plato.
  - Reporte consolidado de rentabilidad cruzando ventas reales con costos de compra e inventario.
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Módulo dedicado en `/admin/costos` (`Costs.jsx`).
- **Qué fue observado (`OBSERVED` en `16-costing-analytics.md`):**
  - Cruza en tiempo real las ventas de `POSContext.sales` con `calculateOrderCost` y recetas.
  - Despliega métricas clave: Food Cost general, costo promedio por producto, insumos con mayor costo y platos con menor margen.
  - Filtros por período (`Hoy`, `7d`, `30d`, `Mes actual`).
- **Estado:** `CONFIRMED_WORKING` (El cálculo matemático teórico es exacto y visualmente superior).

---

## 16. Modificadores de Producto

### FUDO
- **Qué hace:** Grupos de modificadores vinculables tanto a precio como a consumo de inventario.
- **Qué fue documentado (`DOCUMENTED` en Fase 6):**
  - Un modificador (ej. *"Queso extra"*) puede configurarse para:
    1. Sumar un importe al precio final.
    2. Descontar un insumo específico de la receta (`ingrediente: Queso Tybo, cantidad: 50g`).
- **Estado:** `CONFIRMED_WORKING`.

### ARBO OS
- **Qué hace:** Modificadores comerciales seleccionables en el POS (`09-modifiers.md`).
- **Qué fue observado (`OBSERVED`):**
  - `mock/products.js` define modificadores para 9 productos (leches vegetales, extras, puntos de cocción).
  - `salesCalculations.js` suma el `priceDelta` al precio unitario del plato.
  - **GAP Crítico:** Los modificadores **no tienen ningún vínculo con insumos de inventario**. Un shot extra de café o porción extra de palta cobra más dinero, pero no descuenta café ni palta del stock.
  - No existe interfaz administrativa para crear o editar modificadores (`/admin/modificadores` está `available: false`).
- **Estado:** `PARTIAL` / `CODE_ONLY`.

---

## Síntesis Clasificatoria

| Categoría | Clasificación FUDO | Clasificación ARBO OS | Tipo de Brecha |
|---|---|---|---|
| **Venta descuenta Stock** | `CONFIRMED_WORKING` | `NOT_IMPLEMENTED` (Desconectado) | **GAP CRÍTICO** |
| **Cálculo de Costo Ponderado** | `CONFIRMED_WORKING` | `CONFIRMED_WORKING` | **PARIDAD TÉCNICA** |
| **Recetas y Fichas Técnicas** | `CONFIRMED_WORKING` | `CONFIRMED_WORKING` | **PARIDAD TÉCNICA** |
| **Subrecetas Recursivas** | `CONFIRMED_WORKING` | `CODE_ONLY` | **GAP** |
| **Food Cost y Márgenes** | `CONFIRMED_WORKING` | `CONFIRMED_WORKING` (En /admin/costos)| **PARIDAD TÉCNICA** |
| **Modificador descuenta Stock**| `CONFIRMED_WORKING` | `NOT_IMPLEMENTED` | **GAP** |
| **Gestión de Mermas** | `CONFIRMED_WORKING` | `PARTIAL` (BUG-009) | **DIFERENCIA / BUG ARBO** |
| **Inventario Físico (Conteo)**| `CONFIRMED_WORKING` | `CONFIRMED_WORKING` | **PARIDAD TÉCNICA** |
