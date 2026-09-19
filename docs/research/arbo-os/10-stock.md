# 10 — Stock / Inventario

**Rutas:** `/admin/inventario`, `/admin/inventario/:id`, `/admin/inventario/fisico`,
`/admin/movimientos`, `/admin/mermas`
**Estado general:** `PARTIAL` — el módulo de inventario funciona bien **como
sistema aislado**; el eslabón que lo une con la venta no existe.

## 10.1 Volumen de datos

50 insumos · 10 proveedores · 20 compras · 15 recetas · 34 movimientos ·
10 mermas (medido en vivo tras la sesión de prueba).

## 10.2 El hallazgo central: la venta no descuenta stock

**FACT · CODE_ONLY · P1.** Está declarado en el propio código
(`InventoryContext.jsx:18-22`):

> *"las ventas confirmadas en el POS NO descuentan stock automáticamente
> todavía — el servicio de consumo teórico (inventoryConsumptionService) ya
> está listo y se usa para MOSTRAR el consumo/costo de una venta (ver
> VentaDetail), pero conectarlo para mutar stock de verdad queda para cuando
> la venta viva en Supabase."*

`inventoryConsumptionService` existe, calcula correctamente el consumo teórico
de una venta y se usa en **un solo lugar**: `/admin/ventas/:saleId`, para
mostrar el costo. No muta nada.

**Consecuencia:** el stock sólo cambia por compras, ajustes manuales, mermas e
inventario físico. Vender 40 cafés no mueve un gramo de café en el sistema. Los
indicadores de "stock bajo" y "agotado" del Dashboard y del inventario nunca
reaccionan a la operación real. El sistema de inventario es, en la práctica,
un inventario manual con costeo.

Clasificación: es un **gap de diseño consciente**, no un bug. Está en
`26-product-gaps.md`, no en el registro de defectos.

## 10.3 Operaciones que sí mueven stock

| Operación | Función | Estado | Deja movimiento |
|---|---|---|---|
| Recepción de compra | `receivePurchase` | `CONFIRMED_WORKING` (verificado) | sí, tipo `entrada` |
| Ajuste manual | `adjustStock` | `CONFIRMED_WORKING` | sí, tipo `ajuste`, con motivo |
| Merma | `registerWaste` | `PARTIAL` (BUG-009) | sí, tipo `merma` |
| Inventario físico | `createPhysicalInventory` | `CONFIRMED_WORKING` | sí, tipo `ajuste` por cada diferencia |
| **Venta** | — | `NOT_IMPLEMENTED` | — |
| **Devolución a proveedor** | — | `NOT_IMPLEMENTED` | — |
| **Transferencia entre depósitos** | — | `NOT_IMPLEMENTED` | no existe el concepto de depósito |

**Disciplina correcta:** ninguna operación toca `currentStock` sin dejar un
movimiento con `stockBefore` y `stockAfter`. El comentario del código lo
declara como regla (`InventoryContext.jsx:85-86`) y el código la cumple. Es una
buena base de trazabilidad.

## 10.4 Inventario físico — `CONFIRMED_WORKING`

`createPhysicalInventory` (`InventoryContext.jsx:193-224`) recorre las
cantidades contadas por categoría, calcula la diferencia contra el sistema,
genera un movimiento de ajuste **sólo** por los insumos con diferencia
(`if (diff !== 0)`) y guarda el conteo completo —incluidas las líneas sin
diferencia— como registro histórico con `valueDiff` valorizado. Bien resuelto.

## 10.5 Unidades y conversiones

`UNIT_DIMENSIONS` define sólo masa (gramo/kilogramo) y volumen
(mililitro/litro). Las unidades de conteo y packaging (unidad, porción, caja,
pack, botella, otro) **no** son auto-convertibles por diseño, y el archivo lo
argumenta bien: *"una caja no pesa lo mismo para carne que para servilletas"*.
Se resuelven con el factor explícito `unitsToStock` por línea de compra.

**Verificado en vivo** con la compra #2099: `2 Caja` de Carne vacuna con
`1 Caja = 10 Kilogramo` → la UI muestra la equivalencia y `resolvePurchaseLine`
calcula `stockQty = 2 × 10 = 20 kg`, `unitCost = $230.000 / 20 = $11.500/kg`.
Correcto.

**Riesgo (BUG-009):** en `registerWaste`, si la conversión devuelve `null` el
código hace `?? quantity` y usa el número crudo **en la unidad equivocada**.
Es el único lugar donde el sistema abandona su propia regla conservadora.

## 10.6 Errores de redondeo, negativos y concurrencia

| Riesgo | Resultado |
|---|---|
| Stock negativo | **Prevenido**: `adjustStock` y `registerWaste` usan `Math.max(0, ...)`. No se puede dejar stock negativo. |
| Redondeo | Sin errores observados. Se guardan valores con decimales (`39,2`, `34,2`) y se formatean con `formatQty` a 2 decimales. Riesgo latente de punto flotante, no materializado. |
| Cantidades fraccionarias en unidades de conteo | **Presente** — ver BUG-012 (`11,2 Unidad — Pan de campo`). |
| Concurrencia | **No aplica / no resuelto**: un solo cliente, sin transacciones. Dos pestañas divergen (ver `02-database.md` §2.7). |
| Recorte silencioso de mermas | **Presente** — ver BUG-009. |

## 10.7 Alertas y valorización

- `getStockStatus` (`inventoryCostService.js:6-10`): `AGOTADO` si `≤ 0`,
  `STOCK_BAJO` si `≤ stockMin`, si no `NORMAL`. Centralizado, sin comparaciones
  sueltas en componentes. Correcto.
- `calcStockValue` = `currentStock × avgCost`; `calcInventoryTotalValue` suma
  todo el inventario. Correcto.
- El Dashboard muestra "STOCK BAJO: 8" con estos umbrales.
- `purchaseSuggestionService` existe y genera sugerencias de reposición a
  partir de los insumos bajo mínimo.
- **No hay alertas activas**: no hay notificaciones, ni email, ni badges
  persistentes. Sólo un contador en pantalla. `PARTIAL`.

## 10.8 Historial

`/admin/movimientos` lista todos los movimientos con tipo, cantidad,
`stockBefore`, `stockAfter`, motivo, usuario y fecha. Renderiza correctamente
(2.988 caracteres en el barrido). Es el registro más completo del sistema.

Limitación: el `user` es siempre la constante `'Valentina (mozo)'` — ver
`03-auth-permissions.md` §3.3.
