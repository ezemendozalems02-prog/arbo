# 04 — POS / Ventas

**Ruta:** `/admin/pos` (acepta `?table=<tableId>`) · **Archivo:** `src/admin/pages/pos/POS.jsx`
**Estado general:** `PARTIAL` — el circuito de cobro funciona en desktop; tiene
un defecto de dinero (BUG-003) y es inusable en mobile/tablet (BUG-007).

## 4.1 Qué existe

| Capacidad | Estado | Nota |
|---|---|---|
| Grilla de productos por categoría | `CONFIRMED_WORKING` | 35 productos, 12 categorías |
| Agregar producto a la orden | `CONFIRMED_WORKING` | |
| Fusión de líneas idénticas | `CONFIRMED_WORKING` | mismo producto + misma firma de modificadores suma cantidad |
| Modificadores | `CONFIRMED_WORKING` (precio) | ver `09-modifiers.md` |
| Cantidad (stepper) | `PARTIAL` | bloqueado por `sentQty`, ver BUG-003 |
| Eliminar línea | `PARTIAL` | sólo si no se envió a cocina |
| Descuento (monto o %) | `CONFIRMED_WORKING` | |
| Asociar cliente | `PARTIAL` | sólo clientes del mock, ver BUG-006 |
| Enviar a cocina | `CONFIRMED_WORKING` | ver `06-kds.md` |
| Cobrar (4 métodos) | `CONFIRMED_WORKING` | efectivo, tarjeta, Mercado Pago, transferencia |
| Cálculo de vuelto | `CONFIRMED_WORKING` | verificado: $20.000 − $15.200 = $4.800 |
| Dividir cuenta | `UI_ONLY` | calculadora, sin efecto — ver `05-tables-orders.md` |
| Cancelar orden | `PARTIAL` | funciona, pero borra la orden sin dejar registro |
| Orden de mostrador | `CONFIRMED_WORKING` | se crea sola al entrar sin `?table` |
| Comprobante / ticket impreso | `NOT_IMPLEMENTED` | no hay impresión ni PDF ni envío |
| Anulación / devolución de una venta ya cerrada | `NOT_IMPLEMENTED` | una venta confirmada no se puede revertir |
| Propina | `NOT_IMPLEMENTED` | |
| Facturación fiscal (AFIP/ARCA) | `NOT_IMPLEMENTED` | sin CAE, sin tipos de comprobante, sin CUIT |

## 4.2 Lógica de cálculo — verificada

`src/services/salesCalculations.js`. Funciones puras, sin estado. Revisión
línea por línea y verificación en vivo:

- `calcLineUnitPrice` = `unitPrice + Σ priceDelta` de los modificadores. Correcto.
- `calcSubtotal` = `Σ (unitPrice + modificadores) × cantidad`. Correcto.
- `calcDiscountAmount` — `Math.min(Math.max(Math.round(raw), 0), subtotal)`:
  acota el descuento entre 0 y el subtotal. **No puede generar un total
  negativo ni un descuento negativo.** Correcto y defensivo.
- `calcTotal` = `Math.max(subtotal - descuento, 0)`. Correcto.
- `calcChange` = `Math.max(Math.round(recibido - total), 0)`. Correcto.
- `calcSplitEqual` usa `Math.ceil`, así que la suma de las partes es ≥ total
  (nunca queda plata sin cubrir). Decisión correcta.

**Verificación en vivo:** Tostón $6.800 + Copa Malbec ×2 $8.400 = **$15.200**;
recibido $20.000 → vuelto **$4.800**; venta #0001 registrada con esos valores.

**OBSERVED · P3** — todo el dinero se maneja en números JS (punto flotante).
Hoy los precios son enteros en pesos y se redondea en los puntos de salida,
por lo que no se observaron errores. Es un riesgo latente si en el futuro
aparecen precios con decimales o impuestos por línea.

## 4.3 Pruebas de casos borde

| Caso | Resultado | Estado |
|---|---|---|
| Venta simple | Correcta | `CONFIRMED_WORKING` |
| Múltiples productos y cantidades | Correcta, con fusión de líneas | `CONFIRMED_WORKING` |
| Cobrar con `$0` recibido en efectivo | Botón "Confirmar venta" **deshabilitado** (`canConfirm = método !== 'efectivo' || recibido >= total`) | `CONFIRMED_WORKING` |
| Cobrar una orden vacía | Botón "Cobrar" **deshabilitado** (`items.length === 0`) | `CONFIRMED_WORKING` |
| Cobrar con la caja cerrada | Permitido con aviso; la venta queda fuera del arqueo | BUG-008 |
| Cobrar con comandas sin entregar | Permitido con aviso explícito, contando bien las canceladas | `CONFIRMED_WORKING` |
| Venta sin stock | **No se controla**: el POS no consulta stock en ningún momento | `NOT_IMPLEMENTED` |
| Producto sin precio | No reproducible: todos los productos del mock tienen precio | `NOT_TESTED` |
| Producto con receta | Se vende normal; **no descuenta insumos** | ver `10-stock.md` |
| Cancelar una comanda ya enviada | Deja el producto cobrable y bloqueado | **BUG-003** |

## 4.4 Comportamiento tras confirmar la venta

`POSContext.confirmSale` (líneas 303-347) hace, en una sola transacción de
estado:

1. Calcula totales y puntos de fidelización (`pointsForAmount` = 1 punto cada $100).
2. Crea el objeto `sale` con número correlativo.
3. **Elimina la orden** de `state.orders`.
4. Agrega un movimiento a la caja **sólo si está abierta** (BUG-008).
5. Libera la mesa (`status: 'libre'`, `orderId: null`).
6. Acumula los puntos en `customerAdjustments` (no en el CRM — BUG-006).
7. **No toca las comandas** → BUG-004.

La pantalla de éxito está bien resuelta: `CheckoutModal` guarda la venta en
estado local (`completedSale`) y comprueba eso **antes** de `if (!order) return null`
(líneas 30-35), por lo que sigue visible aunque la orden ya no exista. Muestra
número, total, método, vuelto y puntos otorgados. Detalle cuidado.

## 4.5 Listado y detalle de ventas

`/admin/ventas` (`Ventas.jsx`) lee de `POSContext.sales`.

- Búsqueda por número, mesa o cliente: `CONFIRMED_WORKING`.
- Filtro por método de pago: `CONFIRMED_WORKING`.
- Estado vacío diferenciado ("Todavía no se registraron ventas" vs "Sin
  resultados para este filtro"): buen detalle de UX.
- **Sin filtro por fecha ni por período.** Todas las ventas de la historia se
  listan juntas. `NOT_IMPLEMENTED`.
- `SALE_STATUS_LABELS` contempla `aprobado`, `rechazado` y `cancelado`, pero
  `confirmSale` siempre escribe `paymentStatus: 'aprobado'` y no existe ninguna
  acción que produzca los otros dos. Los estados son `CODE_ONLY`.

`/admin/ventas/:saleId` (`VentaDetail.jsx`) muestra el detalle y el consumo
teórico de insumos calculado por `inventoryConsumptionService` — el único lugar
donde ese servicio se usa (ver `10-stock.md`).
