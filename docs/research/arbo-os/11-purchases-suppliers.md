# 11 — Compras y Proveedores

**Rutas:** `/admin/compras`, `/admin/compras/:id`, `/admin/proveedores`, `/admin/proveedores/:id`  
**Archivos principales:** `src/admin/pages/inventory/Purchases.jsx`, `PurchaseDetail.jsx`, `Suppliers.jsx`, `SupplierDetail.jsx`, `src/services/purchaseService.js`, `purchaseSuggestionService.js`, `src/context/InventoryContext.jsx`  
**Estado general:** `PARTIAL` — circuito de carga y recepción con cálculo de costo promedio ponderado funcional; desconectado de cuentas por pagar, caja y facturación formal.

---

## 11.1 Modelo y Volumen de Datos

- **Semilla (`src/mock/suppliers.js`):** 10 proveedores con ID, nombre, CUIT, contacto, teléfono, email, categorías de insumos y condición de pago (`contado`, `cuenta_corriente_15d`, etc.).
- **Semilla (`src/mock/purchases.js`):** 20 órdenes de compra con numeración correlativa (`#2001` a `#2020`), fecha, proveedor, estado (`borrador`, `pendiente`, `recibida`, `cancelada`), líneas de compra con `insumoId`, cantidad, unidad, precio unitario y factor `unitsToStock`.
- **Persistencia mutable:** `arbo_inventory_v1` en `localStorage` almacena el array de compras y proveedores junto con el correlativo `purchaseSeq`.

---

## 11.2 Operaciones Verificadas

| Operación | Función / Componente | Estado | Detalle |
|---|---|---|---|
| Listado y filtrado de compras | `Purchases.jsx` | `CONFIRMED_WORKING` | Búsqueda por número/proveedor, filtros por estado y proveedor. |
| Detalle de compra | `PurchaseDetail.jsx` | `CONFIRMED_WORKING` | Muestra cabecera, proveedor, líneas con subtotales y estado. |
| Carga de nueva compra | `NewPurchaseModal.jsx` | `CONFIRMED_WORKING` | Selección de proveedor, agregado dinámico de líneas, cálculo de total. |
| Recepción de compra | `receivePurchase` (`InventoryContext.jsx:136-153`) | `CONFIRMED_WORKING` | Actualiza stock, recalcula costo ponderado y genera movimientos `entrada`. |
| Cancelar compra | `cancelPurchase` (`InventoryContext.jsx:155-157`) | `PARTIAL` | Funciona en UI para compras borradores/pendientes; vulnerable en contexto (BUG-011). |
| Listado y alta de proveedores | `Suppliers.jsx`, `NewSupplierModal.jsx` | `CONFIRMED_WORKING` | Nombre, CUIT, contacto, teléfono, email, categorías y condición. |
| Edición de proveedor | `SupplierDetail.jsx` | `CONFIRMED_WORKING` | Permite actualizar datos y ver historial de compras asociadas. |
| Sugerencias de reposición | `purchaseSuggestionService.js` | `PARTIAL` | Detecta insumos bajo mínimo; la UI es informativa sin botón para generar orden (UI_ONLY). |
| Pago de compra desde Caja | — | `NOT_IMPLEMENTED` | Registrar o recibir una compra **no genera egreso de caja** ni movimiento financiero. |
| Cuentas por pagar / Cuenta corriente | — | `NOT_IMPLEMENTED` | No hay saldo deudor por proveedor ni vencimientos de facturas. |
| Carga de factura / remito fiscal | — | `NOT_IMPLEMENTED` | Sin número de comprobante fiscal, punto de venta ni discriminación de IVA. |

---

## 11.3 Mecánica de Recepción y Costo Ponderado — Verificada

La función pura `applyPurchaseReceipt` (`src/services/purchaseService.js:28-48`) ejecuta la recepción de una compra con rigor matemático:

```js
const { stockQty, unitCost } = resolvePurchaseLine(line, insumo)
const stockBefore = insumo.currentStock
const newAvgCost = calcWeightedAverageCost(insumo.currentStock, insumo.avgCost, stockQty, unitCost)
const stockAfter = stockBefore + stockQty
```

1. **Conversión de unidades (`resolvePurchaseLine`):**
   - Si la unidad de compra coincide con la de stock (`item.unit === insumo.unit`), multiplica por `unitsToStock || 1`.
   - Si es convertible dimensionalmente (ej. `kg` a `g`, `L` a `ml`), usa `convertQuantity`.
   - Si es unidad de bulto (`caja`, `pack`, `botella`), aplica el factor manual `unitsToStock`.
2. **Costo promedio ponderado (`calcWeightedAverageCost`):**
   `((stockActual × costoPromedioActual) + (cantidadEntrante × costoUnitarioEntrante)) / nuevoStockTotal`.
   - Verificado: previene divisiones por cero (`if (totalQty <= 0) return 0`).
   - Deja intacto el `lastCost = unitCost` para auditoría de precios más recientes.
3. **Trazabilidad:** Genera un registro en `movements` con `type: 'entrada'`, `stockBefore`, `stockAfter`, `reason: 'Compra #XXXX recibida'`, usuario y referencia al ID de compra.

---

## 11.4 Sugerencias de Reposición (`purchaseSuggestionService.js`)

- **Regla determinística:** Si `getStockStatus(item) !== 'NORMAL'`, calcula `suggestedQty = Math.max(item.stockMax - item.currentStock, 0)`.
- **Implementación en UI (`InventoryDashboard.jsx:72-89`):** Renderiza una lista "Necesita reposición" que muestra el insumo, stock actual, mínimo, proveedor habitual y la leyenda `"Comprar X"`.
- **Veredicto (`UI_ONLY` / Incompleto):** No hay affordance ni handler onClick en `"Comprar X"`. No se puede crear una orden de compra pre-poblada desde la sugerencia. El encargado debe anotar los datos manualmente e ir a `/admin/compras` a cargarlos uno por uno.

---

## 11.5 Defectos y Riesgos Identificados

1. **BUG-011 (P3) · `cancelPurchase` sin guardia de estado en contexto:**
   `InventoryContext.jsx:155` no verifica si la compra ya fue `recibida`. Si un componente llamara a `cancelPurchase` sobre una orden ya recibida, el estado pasaría a `cancelada` sin revertir el stock ni los costos ingresados. Protegido en la UI por `PurchaseDetail.jsx:37`, pero ausente en la capa lógica.
2. **BUG-012 (P3) · Cantidades fraccionarias en unidades enteras:**
   Se observan compras mock con `11.2 Unidad — Pan de campo` o `18.9 Unidad — Medialunas`. El sistema no fuerza redondeo a enteros en unidades de conteo.
3. **GAP Financiero Central (P1):** La recepción de compras **no tiene conexión alguna con el módulo de Caja** (`/admin/caja`). Las compras figuran pagadas u operadas en el vacío sin que se registre un egreso de fondos ni un pasivo comercial.
