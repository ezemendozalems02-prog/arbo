# 25 — Registro de bugs y defectos

Severidad: **P0** crítico · **P1** alto · **P2** medio · **P3** bajo.
Ningún defecto de este registro fue corregido — la auditoría es de sólo lectura.

Sólo se listan aquí **defectos**: cosas que no hacen lo que el propio sistema
promete. Lo que falta pero nunca se prometió está en `26-product-gaps.md`.

---

## BUG-001 · P0 · Público/Pedidos — el pedido online no se envía a ningún lado

- **Módulo:** sitio público, `/pedidos`
- **Estado:** `BROKEN`
- **Archivo:** `src/pages/Pedidos.jsx:166-170`

```js
const confirmOrder = () => {
  setOrderId(`ARBO-${Math.floor(1000 + Math.random() * 9000)}`)
  setStep('done')
  clearCart()
}
```

**Reproducción:** abrir `/pedidos`, agregar productos, completar los 3 pasos
del checkout (datos de entrega, resumen, confirmar).

**Esperado:** el pedido llega al restaurante por algún canal (WhatsApp, email,
backend, o al menos la bandeja `/admin/pedidos`).

**Real:** se genera un número **aleatorio**, se muestra la pantalla "Pedido
recibido — Te avisaremos cuando esté listo. #ARBO-XXXX" y se vacía el carrito.
El nombre, teléfono, dirección, indicaciones y los productos **se descartan**.
No hay `fetch`, ni `wa.me`, ni `mailto:`, ni escritura a `localStorage`, ni
inserción en el estado del admin. Nadie en el restaurante se entera nunca.

**Impacto:** un cliente real cree que hizo un pedido de delivery que nunca
existió. Pérdida de venta y de confianza, sin ninguna señal para el negocio.

**Causa probable:** la pantalla de éxito se construyó antes que el canal de
salida, y el canal nunca se conectó.

---

## BUG-002 · P0 · Público/Reservas — la reserva "confirmada" no existe

- **Módulo:** sitio público, `/reservas`
- **Estado:** `BROKEN`
- **Archivo:** `src/pages/Reservas.jsx:63-68`

```js
const next = () => {
  if (step === 4) setReservationId(`ARBO-${Math.floor(1000 + Math.random() * 9000)}`)
  setStep(s => Math.min(s + 1, STEPS.length - 1))
}
```

**Reproducción:** completar el flujo de 5 pasos de `/reservas`.

**Esperado:** la reserva se registra y aparece en el panel.

**Real:** se muestra **"Reserva confirmada"** con fecha, hora, mesa, nombre y
un ID aleatorio. No se envía ni se guarda nada. El módulo `/admin/reservas`
está marcado `available: false` ("Próximamente"), así que no hay siquiera un
destino posible.

**Impacto:** mayor que BUG-001 — el sistema emite una **confirmación
afirmativa** de un compromiso que el negocio no puede cumplir porque nunca lo
recibió. Riesgo directo de clientes que se presentan con una reserva
inexistente.

---

## BUG-003 · P1 · POS/Cocina — cancelar una comanda deja el producto cobrable y bloqueado

- **Módulo:** POS + KDS
- **Estado:** `BROKEN`
- **Archivos:** `src/context/POSContext.jsx:285-291` (`cancelTicket`),
  `src/services/kitchenService.js:27-31` (`buildPendingTicketItems`),
  `src/admin/components/pos/OrderPanel.jsx:68-73`
- **Evidencia:** `evidence/04-bug-comanda-cancelada-sigue-cobrandose.png`

**Reproducción (verificada en vivo):**

1. Abrir Mesa 1, agregar `Tostón de Palta ×1` y `Copa Malbec ×2`.
2. "Enviar comanda" → se crean `#1-A` (cocina) y `#1-B` (bar).
3. En `/admin/cocina`, pestaña BAR, cancelar `#1-B` con motivo
   "Producto sin stock".
4. Volver a `/admin/pos?table=t1`.

**Esperado:** al cancelarse la comanda, el producto se quita de la cuenta o al
menos queda liberado para editarlo o volver a enviarlo.

**Real (estado leído de `localStorage`):**

```json
{"tickets":[{"code":"1-A","status":"SENT"},{"code":"1-B","status":"CANCELLED","reason":"Producto sin stock"}],
 "items":[{"n":"Tostón de Palta","qty":1,"sentQty":1},{"n":"Copa Malbec Patagónico","qty":2,"sentQty":2}]}
```

`cancelTicket` cambia el estado de la comanda pero **no toca `sentQty`** de las
líneas del pedido. Como consecuencia, en el panel de la orden:

- La línea sigue facturándose: **Subtotal $15.200 / Total $15.200**, incluidos
  los $8.400 del Malbec cancelado.
- La UI muestra **"✓ 2 ENVIADOS A COCINA"** para un producto cuya comanda fue
  cancelada: el sistema afirma algo falso.
- Botón "Restar" **deshabilitado** (`min={item.sentQty}`).
- Botón "Eliminar" **no se renderiza** (sólo aparece si `sentQty === 0`).
- Botón de envío **deshabilitado** y rotulado "COMANDA ENVIADA", porque
  `buildPendingTicketItems` calcula `quantity - sentQty = 0`.

**Impacto:** estado sin salida. Se le cobra al cliente un producto que la
cocina canceló por falta de stock, y el cajero no tiene ninguna forma de
quitarlo salvo cancelar la orden entera (perdiendo todo lo demás). Es un error
de dinero, no cosmético.

---

## BUG-004 · P1 · POS/Cocina — comandas huérfanas: se cobra la mesa y la comanda sigue viva

- **Módulo:** POS + KDS
- **Estado:** `BROKEN`
- **Archivo:** `src/context/POSContext.jsx:303-347` (`confirmSale`)
- **Evidencia:** `evidence/05-bug-comanda-huerfana-tras-cobro.png`

**Reproducción (verificada en vivo):** con la comanda `#1-A` en estado `SENT`,
cobrar la mesa (venta #0001, $15.200, efectivo).

**Esperado:** al cerrar la venta, las comandas pendientes se cierran, se
cancelan o al menos se marcan para revisión.

**Real:** `confirmSale` elimina la orden de `state.orders` (línea 325) y libera
la mesa, pero **no toca `state.tickets`**. Estado posterior:
`tickets: ["1-A:SENT", "1-B:CANCELLED"]`, `ordersLeft: 0`, `t1: "libre"`.

En `/admin/cocina` la comanda `#1-A` sigue en la columna "NUEVOS", rotulada
**"Mesa 1"**, con el cronómetro corriendo (03:56 al momento de la captura) y
avanzando hacia el umbral de "DEMORADO" (12 min, `kitchenConfig.js:40-43`).
Apunta con `orderId` a una orden que ya no existe.

**Impacto doble:**

1. La cocina sigue preparando un plato de una mesa ya cobrada y liberada.
2. Si se vuelve a abrir la Mesa 1 para otro grupo, la comanda fantasma sigue
   rotulada "Mesa 1" y se confunde con el pedido nuevo.

**Nota:** `cancelOrder` **sí** cancela las comandas vivas
(`POSContext.jsx:212-222`). La omisión está sólo en el camino de cobro, que es
el camino normal.

---

## BUG-005 · P1 · Dashboard — las ventas reales del POS no llegan al Dashboard

- **Módulo:** Dashboard / Reportes
- **Estado:** `BROKEN` (inconsistencia entre pantallas)
- **Archivos:** `src/services/dashboardService.js:5-31`, `src/admin/pages/Dashboard.jsx:32-39`

**Reproducción (verificada en vivo):** anotar `VENTAS DE HOY` en `/admin`,
registrar una venta real de $15.200 en el POS, volver a `/admin`.

**Esperado:** el KPI sube $15.200, o al menos cambia.

**Real:** sigue exactamente en **$585.300** y `PEDIDOS` sigue en **36**.

`getDashboardSummary()` lee de `mock/orders.js` (`ORDERS`), un universo de
datos que no tiene ninguna conexión con `POSContext.sales`. Además, la página
memoiza con `useMemo(..., [])`, así que ni siquiera recalcularía dentro de la
misma sesión.

**Impacto:** el tablero principal del negocio muestra cifras que no
corresponden a la operación real. Todo lo que se cobre por el POS es invisible
en el Dashboard, y `/admin/ventas` y `/admin/caja` dicen otra cosa.

---

## BUG-006 · P1 · CRM/POS — un cliente creado en el CRM no existe para el POS

- **Módulo:** CRM + POS
- **Estado:** `BROKEN`
- **Archivos:** `src/admin/components/pos/CustomerPickerModal.jsx:4,19`,
  `src/context/POSContext.jsx:3`
- **Evidencia:** `evidence/06-bug-cliente-crm-invisible-en-pos.png`

**Reproducción (verificada en vivo):**

1. `/admin/clientes` → "Nuevo cliente" → crear "Zulema Auditoria".
2. Se crea correctamente (`arbo_crm_v1`, id `cli-mu7yxosk-93ln`) y aparece en
   el listado del CRM.
3. `/admin/pos` → "+ Asociar cliente" → buscar "Zulema".

**Esperado:** aparece el cliente recién creado.

**Real:** **"Sin resultados para Zulema"**.

`CustomerPickerModal` importa `CUSTOMERS` directamente de `mock/customers.js`,
un array estático de 126 registros. El CRM mantiene una copia separada en su
propio contexto. Las dos listas nunca se sincronizan.

**Impacto:** un cliente nuevo no puede asociarse a una venta, ni acumular
puntos en su primera visita. El circuito de alta de cliente está roto justo en
el punto donde el negocio lo necesita (el mostrador). Ver también §2.5(b) de
`02-database.md`: los puntos ganados en el POS tampoco se reflejan en la ficha
del CRM, ni al revés.

---

## BUG-007 · P1 · Responsive — el POS es inusable en teléfono y en tablet vertical

- **Módulo:** POS
- **Estado:** `BROKEN`
- **Archivo:** `src/admin/pages/pos/POS.jsx:90`
- **Evidencia:** `evidence/07-pos-mobile-390.png`

```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20, ... }}>
```

La grilla es fija y **no tiene media query**, aunque el resto del admin sí usa
`useIsMobile()`.

**Medición de `gridTemplateColumns` computado:**

| Viewport | Columnas resueltas | Resultado |
|---|---|---|
| 390 px (iPhone 14) | `0px 340px` | grilla de productos de **0 px**; el panel de pedido se superpone sobre las tarjetas |
| 768 px (iPad vertical) | `84px 340px` | 84 px para toda la carta: inoperable |
| 1024 px | `340px 340px` | apretado pero funcional |
| 1440 px | correcto | funcional |

**Impacto:** en un teléfono no se puede agregar **ningún** producto a una
orden: la columna de productos mide cero. El peor caso es 768 px, que es
exactamente el ancho de un iPad en vertical, el dispositivo más habitual para
un POS de salón.

---

## BUG-008 · P2 · Caja — una venta con la caja cerrada nunca entra al arqueo

- **Módulo:** Caja / POS
- **Estado:** `PARTIAL` (comportamiento avisado, consecuencia no resuelta)
- **Archivos:** `src/context/POSContext.jsx:326-329`,
  `src/admin/components/pos/CheckoutModal.jsx:77-81`

Si la caja está cerrada, `confirmSale` registra la venta en `sales` pero
**no** agrega el movimiento a `cash.movements`. El modal avisa ("la venta se va
a registrar igual, pero abrí la caja para que el efectivo cuadre en el
arqueo"), lo que lo saca de la categoría de bug silencioso.

El defecto real es que **no existe ninguna forma de recuperar esa venta**
después: al abrir la caja, `openCashRegister` **reinicia** `movements: []`
(`POSContext.jsx:70`). La venta queda permanentemente fuera del arqueo, sin
listado de "ventas fuera de caja" ni posibilidad de imputarla.

**Impacto:** diferencia de caja irreconciliable, con dinero físico en el cajón
que el sistema no espera.

---

## BUG-009 · P2 · Mermas — la cantidad se recorta en silencio

- **Módulo:** Inventario / Mermas
- **Estado:** `PARTIAL`
- **Archivo:** `src/context/InventoryContext.jsx:167-168`

```js
const qtyInStockUnit = convertQuantity(quantity, unit, item.unit) ?? quantity
const clampedQty = Math.min(qtyInStockUnit, item.currentStock)
```

Si se registra una merma mayor al stock disponible, el sistema la **recorta
silenciosamente** al stock actual y guarda ese valor recortado como si fuera lo
declarado. No hay aviso, ni confirmación, ni registro de la diferencia.

Segundo problema en la misma línea: si las unidades no son convertibles
(`convertQuantity` devuelve `null`), el `?? quantity` usa el número **crudo en
la unidad equivocada** — por ejemplo, tratar 2 "cajas" como 2 "kilogramos".

**Impacto:** la merma registrada no coincide con la real; se pierde la señal de
que el stock del sistema estaba mal. Enmascara justamente el problema que el
módulo de mermas debería exponer.

---

## BUG-010 · P2 · ARBO Club — se puede cancelar un canje ya utilizado y devolver los puntos

- **Módulo:** ARBO Club / Canjes
- **Estado:** `BROKEN` (lógica), alcance real limitado por la UI
- **Archivo:** `src/context/CRMContext.jsx:171-181`

```js
const redemption = s.redemptions.find(r => r.id === redemptionId)
if (!redemption || redemption.status === 'cancelado') return s
```

La única guarda es contra el doble cancelado. Un canje en estado `utilizado`
(el beneficio ya se entregó al cliente) **puede cancelarse**, y
`applyPointsTransaction` le devuelve los puntos.

**Impacto:** el cliente se queda con el beneficio **y** con los puntos.
Clasificado P2 y no P1 porque no se verificó que la UI ofrezca el botón
"Cancelar" sobre canjes ya utilizados — marcado `NOT_TESTED` en ese punto
concreto. La lógica del contexto no lo impide.

---

## BUG-011 · P3 · Compras — `cancelPurchase` no valida el estado

- **Módulo:** Compras
- **Estado:** `PARTIAL` (defensa en profundidad ausente)
- **Archivo:** `src/context/InventoryContext.jsx:155-157`

`receivePurchase` valida correctamente (`if (... status === 'recibida' || 'cancelada') return s`),
pero `cancelPurchase` no valida nada: marcaría como cancelada una compra ya
recibida **sin revertir** el stock ni el costo promedio.

**Verificado:** la UI lo previene — `PurchaseDetail.jsx:37` define
`canAct = status === 'pendiente' || 'borrador'` y oculta ambos botones en una
compra recibida. Por eso es P3 y no P1: hoy no es alcanzable desde la
interfaz. Queda como defecto latente.

---

## BUG-012 · P3 · Cantidades fraccionarias en unidades de conteo

- **Módulo:** Compras / Inventario
- **Estado:** `OBSERVED`

La compra #2018 contiene líneas como `11.2 Unidad — Pan de campo` y
`18.9 Unidad — Medialunas de manteca`. No se pueden comprar 11,2 panes. El
modelo no distingue unidades continuas (kg, L) de unidades de conteo (unidad,
caja, pack), y no fuerza enteros en las segundas. Afecta tanto a la semilla
mock como a la carga manual.

---

## BUG-013 · P3 · Sitio público — no existe página 404

- **Módulo:** sitio público
- **Estado:** `OBSERVED`
- **Archivo:** `src/App.jsx:64` — `<Route path="*" element={<Home />} />`

Cualquier URL inexistente devuelve la home con status 200. Perjudica al SEO
(contenido duplicado, sin señal de error) y desorienta al usuario, que no
entiende por qué llegó a la portada.

---

## BUG-014 · P3 · Admin — ruta inexistente renderiza una pantalla vacía

- **Módulo:** ARBO OS
- **Estado:** `OBSERVED`
- **Archivo:** `src/admin/AdminApp.jsx:110-124`

El router del admin no declara ruta comodín. `/admin/cualquier-cosa` renderiza
el layout completo (sidebar + header con el título genérico "ARBO OS") y el
área de contenido **vacía**, sin mensaje de error ni forma de entender qué pasó.

---

## BUG-015 · P3 · Buscador de clientes del POS sin affordance de mínimo

- **Módulo:** POS
- **Estado:** `OBSERVED`
- **Archivo:** `src/admin/components/pos/CustomerPickerModal.jsx:19`

`const results = q.length >= 2 ? ... : []`. Con un solo carácter no se muestra
nada **ni un mensaje**: el modal parece vacío o roto. El estado "Sin resultados
para X" sólo aparece a partir de 2 caracteres.

---

## BUG-016 · P3 · Alta de cliente sin validación de email

- **Módulo:** CRM
- **Estado:** `OBSERVED`
- **Archivo:** `src/admin/components/crm/NewCustomerModal.jsx:31`

El input de email es `<input>` sin `type="email"` ni validación. Durante la
prueba se guardó `"+54 9 2945 000111"` como email sin ninguna objeción. Lo
mismo con teléfono (sin `type="tel"`). La única validación del formulario es
`name.trim().length > 1`.

---

## BUG-017 · P3 · Configuración muerta: `externalMenuUrl`

- **Módulo:** sitio público
- **Estado:** `OBSERVED`
- **Archivo:** `src/data/site.js:28`

`externalMenuUrl: 'https://menu.fu.do/arbocafe/qr-menu'` está definido pero
**no se referencia en ningún archivo** del proyecto. Es configuración muerta
que apunta a un proveedor externo de carta QR.

---

## BUG-018 · P1 · Caja — Destrucción total del historial de movimientos y turnos anteriores

- **Módulo:** Caja / Arqueos
- **Estado:** `BROKEN`
- **Archivos:** `src/context/POSContext.jsx:70`, `src/admin/pages/pos/Caja.jsx:28-41`

```js
const openCashRegister = useCallback((initialAmount) => {
  setState(s => ({
    ...s,
    cash: { ...s.cash, status: 'abierta', openedAt: new Date(), closedAt: null, initialAmount, movements: [] },
  }))
}, [])
```

Al abrir un nuevo turno, la instrucción `movements: []` reinicia el array y
**destruye permanentemente todos los ingresos, egresos y ventas en efectivo del
turno anterior**. Adicionalmente, `lastClosing` almacena solo un objeto plano:
al cerrar un segundo turno, el arqueo del primero se sobrescribe.

**Impacto:** Imposibilidad de auditoría contable o fiscal retrospectiva. No
queda registro histórico de diferencias de arqueo acumuladas en el tiempo.

---

## BUG-019 · P2 · Caja — Arqueo no ciego y cierre con descuadre sin justificación

- **Módulo:** Caja / Arqueos
- **Estado:** `OBSERVED`
- **Archivo:** `src/admin/components/pos/CloseCashModal.jsx:20-23`

El modal de cierre muestra explícitamente el valor de **"Efectivo esperado"**
en pantalla antes de que el cajero cuente el dinero físico en el cajón. Además,
el sistema permite confirmar el cierre con cualquier descuadre negativo o
positivo sin exigir un campo obligatorio de motivo, justificación ni PIN de
supervisor.

**Impacto:** Elimina la eficacia del control por arqueo ciego, facilitando
ajustes de conveniencia y fraude interno.

---

## BUG-020 · P2 · CRM — Deduplicación implementada pero jamás invocada (`CODE_ONLY`)

- **Módulo:** CRM
- **Estado:** `CODE_ONLY`
- **Archivos:** `src/services/customerMatchingService.js:5-27`,
  `src/admin/components/crm/NewCustomerModal.jsx:20-25`

Las funciones `findCustomerByContact` y `findOrCreateCustomer` fueron creadas
para evitar duplicados por email o teléfono normalizado. Sin embargo,
`NewCustomerModal` no importa ni utiliza este servicio: crea un cliente nuevo
incondicionalmente, permitiendo duplicar fichas de clientes ilimitadamente.

**Impacto:** Fragmentación del historial de consumo y puntos de los clientes.

---

## BUG-021 · P1 · ARBO Club — Los canjes no pueden consumirse ni aplicarse en el POS

- **Módulo:** ARBO Club / POS
- **Estado:** `BROKEN` (Desconexión)
- **Archivos:** `src/admin/components/pos/CheckoutModal.jsx`,
  `src/admin/components/pos/OrderPanel.jsx`, `src/context/POSContext.jsx`

El POS no dispone de ningún campo de entrada, botón ni validador para canjear
códigos de beneficio (`ARBO-XXXXX`). Un cliente con un canje activo no puede
utilizarlo en caja.

**Impacto:** El circuito de fidelización queda inutilizable en el punto de cobro.

---

## BUG-022 · P2 · Sitio público — Portal ARBO Club es una maqueta estática

- **Módulo:** sitio público / ARBO Club
- **Estado:** `UI_ONLY`
- **Archivo:** `src/pages/ArboClub.jsx:3, 27-43`

La página `/arbo-club` importa `DEMO_MEMBER` con 2.840 puntos fijos. No existe
pantalla de inicio de sesión ni buscador de saldo de puntos para clientes
reales.

**Impacto:** Experiencia ficticia para el comensal.

---

## BUG-023 · P2 · Marketing — Automatizaciones leen de mocks estáticos

- **Módulo:** Marketing / Automatizaciones
- **Estado:** `BROKEN`
- **Archivo:** `src/services/automationService.js:4-5`

`automationService.js` importa `ORDERS` y `REDEMPTIONS` desde archivos mock
estáticos. Las ventas y canjes realizados en la sesión no son leídos por los
triggers, impidiendo que las reglas de automatización reaccionen a la operación
en vivo.

**Impacto:** Los disparadores automáticos ignoran los eventos reales del día.

---

## BUG-024 · P1 · Público/Franquicia — Formulario descarta datos de postulantes

- **Módulo:** sitio público / Franquicias
- **Estado:** `BROKEN`
- **Archivo:** `src/pages/Franquicia.jsx:20-22`

```js
const submit = (e) => {
  e.preventDefault()
  setSent(true) // DEMO — no hay backend; en producción esto envía el formulario a un endpoint real.
}
```

El formulario `/franquicia` recibe nombre, empresa, teléfono, email y capital
disponible, pero al presionar "Solicitar dossier" solo cambia un booleano local.
Los datos no se envían por correo ni se guardan en ninguna base ni en el CRM.

**Impacto:** Pérdida silenciosa de potenciales franquiciados e inversores.

