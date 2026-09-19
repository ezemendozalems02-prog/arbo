# 05 — Mesas y órdenes

**Rutas:** `/admin/mesas`, `/admin/comandas` · **Archivos:** `src/admin/pages/pos/Mesas.jsx`,
`src/admin/components/pos/TableCard.jsx`, `TableDetailModal.jsx`, `OpenTableModal.jsx`
**Estado general:** `PARTIAL`

## 5.1 Modelo

14 mesas semilla (`mock/tables.js`), agrupadas en 3 zonas (`interior`,
`ventana`, `exterior`), con capacidad declarada. 4 estados posibles:
`libre`, `ocupada`, `reservada`, `pago_pendiente`.

**OBSERVED** — de los 4 estados, sólo 3 son alcanzables en la práctica:

- `libre` y `ocupada`: funcionan (verificado).
- `pago_pendiente`: sólo lo escribe `startPayment(tableId)`
  (`POSContext.jsx:202-205`). Se verificó que la función existe y está
  expuesta en el contexto, pero **no se encontró ningún componente que la
  invoque**. `CODE_ONLY`.
- `reservada`: ninguna función del sistema lo escribe nunca. El módulo de
  reservas está `available: false`. `CODE_ONLY`.

## 5.2 Operaciones verificadas

| Operación | Estado | Detalle |
|---|---|---|
| Ver mapa de mesas por zona | `CONFIRMED_WORKING` | 14 mesas, estado y capacidad visibles |
| Abrir mesa | `CONFIRMED_WORKING` | modal pide cantidad de personas; crea la orden y navega al POS con `?table=` |
| Asignar cliente al abrir | `PARTIAL` | sólo clientes del mock (BUG-006) |
| Agregar productos | `CONFIRMED_WORKING` | desde el POS o desde el detalle de mesa |
| Enviar comanda desde la mesa | `CONFIRMED_WORKING` | |
| Cobrar desde la mesa | `CONFIRMED_WORKING` | |
| Cancelar orden | `PARTIAL` | libera la mesa y cancela las comandas vivas, pero **borra** la orden sin dejar registro |
| Dividir cuenta | `UI_ONLY` | ver §5.3 |
| **Cambiar / mover de mesa** | `NOT_IMPLEMENTED` | no existe ninguna función de transferencia |
| **Unir mesas** | `NOT_IMPLEMENTED` | |
| **Transferir productos entre mesas** | `NOT_IMPLEMENTED` | |
| **Reasignar mozo** | `NOT_IMPLEMENTED` | hay un único usuario hardcodeado |

**Prueba de apertura (verificada en vivo):** clic en M01 → modal "Abrir Mesa 1"
con stepper de personas → "ABRIR MESA" → navega a `/admin/pos?table=t1`.
Estado resultante leído de `localStorage`:

```json
{"orders":[{"id":"order-mu7yfd9s-bod4","number":1,"tableNumber":1,"partySize":2,"items":0}],
 "t1":{"id":"t1","number":1,"zone":"interior","capacity":2,"status":"ocupada","orderId":"order-mu7yfd9s-bod4"}}
```

Correcto: una sola orden, mesa ocupada, vínculo bidireccional bien establecido.

## 5.3 Dividir cuenta — `UI_ONLY`

`SplitBillModal.jsx` es **una calculadora**, no una operación. Permite elegir
el número de partes y muestra `total / partes` redondeado hacia arriba. No
registra nada, no genera pagos parciales, no divide la orden, no persiste.
Cerrar el modal no deja rastro.

Está honestamente rotulado en la propia UI: *"División equitativa del total. La
división por producto llega en una próxima etapa."*

Nota: `confirmSale` acepta un parámetro `split` y lo guarda en la venta, pero
el valor que llega desde `CheckoutModal` proviene de un campo distinto
(el `<details>` "Dividir cuenta en partes iguales" del propio checkout), no de
`SplitBillModal`. Son dos calculadoras separadas para lo mismo.

## 5.4 Protección de líneas ya enviadas

`POSContext.updateItemQuantity` (líneas 157-173) y `removeItem` (175-183)
implementan una regla deliberada y bien comentada: una línea ya enviada a
cocina no puede bajar de `sentQty` ni eliminarse. El *clamp* se aplica en el
contexto, no en el componente, así que ningún llamador puede saltearlo.

La intención es correcta. **El problema es la ausencia de la contraparte:**
cancelar la comanda no libera la línea. Ver BUG-003.

## 5.5 Consistencia UI ↔ estado ↔ POS ↔ KDS ↔ caja

Resultado de la verificación end-to-end (ver `24-end-to-end-journeys.md`):

| Par | Consistente | Nota |
|---|---|---|
| UI de mesas ↔ estado | Sí | ocupar/liberar se refleja de inmediato |
| Mesa ↔ orden | Sí | vínculo bidireccional correcto |
| Orden ↔ POS | Sí | |
| Orden → KDS | Sí al enviar | pero **no** al cobrar → BUG-004 |
| Orden ↔ Caja | Sí con caja abierta | **no** con caja cerrada → BUG-008 |
| Venta ↔ Dashboard | **No** | universos separados → BUG-005 |
| Orden ↔ Stock | **No** | la venta no descuenta insumos |

## 5.6 Comandas (`/admin/comandas`)

`src/admin/pages/kitchen/Comandas.jsx` — vista de listado de todas las
comandas, transversal a los sectores, con su estado, mesa y tiempos. Es la
contraparte administrativa del KDS. Renderiza correctamente
(`main_chars=256` en el barrido, estado vacío al no haber comandas activas).

Comparte el mismo origen de datos que el KDS (`POSContext.tickets`), por lo que
hereda BUG-003 y BUG-004.
