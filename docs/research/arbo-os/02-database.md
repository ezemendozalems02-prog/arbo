# 02 — "Base de datos": modelo de datos y persistencia

## 2.1 Veredicto

**FACT · NOT_IMPLEMENTED** — no existe base de datos. No hay Supabase,
Postgres, ni ningún motor. Por lo tanto **no existen**: tablas, columnas
tipadas, foreign keys, índices, constraints, enums de base, triggers,
functions, views, RLS, policies, roles de base, soft delete a nivel motor,
ni aislamiento multi-tenant.

Todo lo que el brief pide auditar en su sección 07 no tiene objeto sobre el
cual ejecutarse. Lo que sí existe y sí se audita acá es el modelo de datos en
memoria y su persistencia en `localStorage`.

## 2.2 Las dos capas de datos

### Capa 1 — Semilla estática (`src/mock/`, 25 archivos)

Módulos JS que exportan constantes. Se evalúan una vez al cargar el bundle.
Son inmutables en runtime: ninguna acción del usuario los modifica.

| Archivo | Contenido | Volumen |
|---|---|---|
| `customers.js` | 126 clientes generados con PRNG determinístico (`createRng(2026)`) | 126 |
| `products.js` | Deriva de `src/data/menu.js`; agrega modificadores y sector | 39 productos |
| `tables.js` | `INITIAL_TABLES` | 14 mesas |
| `orders.js` | Pedidos online/históricos — universo separado del POS (ver 2.5) | 36 "de hoy" |
| `reservations.js` | Reservas | — |
| `inventoryItems.js`, `recipes.js`, `purchases.js`, `suppliers.js`, `waste.js`, `stockMovements.js` | Semilla de inventario | — |
| `loyaltyLevels.js`, `loyaltyTransactions.js`, `rewards.js`, `redemptions.js` | Semilla ARBO CLUB | — |
| `segments.js`, `campaigns.js`, `automations.js` | Semilla marketing | — |
| `modifiers.js`, `stations.js`, `units.js`, `inventoryCategories.js`, `kitchenConfig.js` | Catálogos de configuración | — |
| `staff.js` | Un solo usuario hardcodeado: `CURRENT_STAFF_NAME = 'Valentina (mozo)'` | 1 |
| `config.js` | `MOCK_NOW` + PRNG | — |

### Capa 2 — Estado mutable (React Context to localStorage)

Cuatro claves de `localStorage`, sin namespace por negocio ni por usuario.
Medición real tras una sesión de prueba con una sola venta:

| Clave | Contexto | Raíces del estado | Tamaño medido |
|---|---|---|---|
| `arbo_pos_v1` | `POSContext` | `tables, orders, sales, tickets, cash, customerAdjustments, saleSeq, orderSeq` | 3,5 KB |
| `arbo_inventory_v1` | `InventoryContext` | `items, suppliers, recipes, purchases, waste, movements, physicalInventories, auditLog, purchaseSeq` | 44 KB |
| `arbo_crm_v1` | `CRMContext` | `customers, levels, transactions, rewards, redemptions, segments, campaigns, automations, automationRuns, auditLog` | **176 KB** |
| `arbo_cart_v1` | `useCart` (sitio público) | array de ítems del carrito | 2 B |

## 2.3 Mecánica de persistencia

Los tres contextos usan el mismo patrón (`POSContext.jsx:46-64`,
`InventoryContext.jsx:54-71`, `CRMContext.jsx:60-77`): cargan con
`{ ...initialState(), ...reviveDates(JSON.parse(raw)) }` y guardan con un
`useEffect` sobre `[state]` que hace `localStorage.setItem(KEY, JSON.stringify(state))`.

### Problemas confirmados de este mecanismo

**OBSERVED · P2 — Serialización completa en cada cambio.** Cualquier mutación
re-serializa el estado entero. En CRM eso significa `JSON.stringify` sobre
176 KB por cada nota, tag o ajuste de puntos.

**INFERENCE · P2 — Riesgo de cuota silencioso.** `localStorage` ronda los 5 MB
por origen. El bloque `catch` está **vacío** en los tres contextos: si se
excede la cuota, la escritura falla sin aviso, sin toast y sin log. La UI
sigue mostrando el estado en memoria como si se hubiera guardado, y los datos
se pierden al recargar. No verificado empíricamente (`NOT_TESTED`), pero el
código no tiene ninguna ruta de manejo del error.

**OBSERVED · P2 — Merge superficial en la carga.** El spread es de un solo
nivel. Si se agrega un campo dentro de un sub-objeto ya persistido (por
ejemplo dentro de `cash`), el estado guardado pisa el sub-objeto entero y el
campo nuevo queda `undefined`. No hay versionado de esquema ni migración: la
única defensa es el sufijo `_v1` de la clave, que nadie incrementa
automáticamente.

**OBSERVED · P2 — Rehidratación de fechas por lista blanca de nombres.** Cada
contexto declara su propio `DATE_KEYS` y revive sólo esas claves
(`POSContext.jsx:32`, `InventoryContext.jsx:40`, `CRMContext.jsx:46`). Las
tres listas no coinciden entre sí. Cualquier campo de fecha que se agregue y
no se registre en la lista correcta sobrevive como `string`, y toda
aritmética posterior (`now - fecha`, `.getHours()`) se rompe en silencio o
devuelve `NaN`. Es un acoplamiento frágil por convención de nombres.

## 2.4 Entidades y relaciones reales

Las relaciones se expresan como campos `xxxId` sin ninguna garantía de
integridad referencial: no hay foreign keys, ni cascadas, ni validación.

```
tables --orderId--> orders --+-- items[] (productId --> mock/products)
                             +-- customerId --> mock/customers
                             +-- discount
                             +-- ticketIds[] --> tickets

orders --(al cobrar)--> sales      [la orden se BORRA]
tickets --orderId--> orders        [queda colgando: ver 2.6]
cash.movements[] <--(al cobrar, si la caja está abierta)-- sales

inventoryItems <--insumoId-- movements | waste | recipes.ingredients | purchases.items
recipes --productId--> mock/products

crm.customers <--customerId-- transactions | redemptions | notes
rewards <--rewardId-- redemptions
segments <--segmentId-- campaigns
```

### Huérfanos — respuesta directa a las preguntas del brief

**¿Puede existir información huérfana? Sí, CONFIRMED.** Al confirmar una venta
la orden se elimina de `state.orders` (`POSContext.jsx:325`) pero sus comandas
no se cierran. Quedan tickets `SENT`/`PREPARING` apuntando con `orderId` a una
orden inexistente. Reproducido en vivo — ver `BUG-002` en `25-bugs.md` y
`evidence/05-bug-comanda-huerfana-tras-cobro.png`.

**Segundo caso, CONFIRMED por código:** `cancelOrder` (`POSContext.jsx:207-231`)
borra la orden en lugar de marcarla como cancelada. No queda registro alguno
de las órdenes canceladas: ni en `sales`, ni en un log, ni en auditoría. Es
pérdida de información de negocio por diseño (cuántas órdenes se abandonan,
por cuánto valor, quién las canceló).

**¿Puede eliminarse información que debería conservarse? Sí.** Además de lo
anterior, `orders` se borra en los dos caminos de salida (cobro y
cancelación), y no existe ningún soft delete en todo el sistema.

**¿Puede un usuario acceder a datos de otro negocio o sucursal? No aplica.**
No existe el concepto de negocio ni de sucursal — ver `16-multibranch.md`.

## 2.5 Split-brain de datos confirmados

Tres roturas de "fuente única de verdad", todas verificadas.

### (a) Ventas: dos universos disjuntos — P1

- `mock/orders.js` (`ORDERS`) alimenta exclusivamente el Dashboard, vía
  `services/dashboardService.js`.
- `POSContext.sales` alimenta `/admin/ventas`, `/admin/caja` y el detalle de
  venta.

No se cruzan en ningún punto. **Verificado en vivo:** tras registrar una venta
real de $15.200 en el POS, el Dashboard siguió mostrando `VENTAS DE HOY
$585.300`, sin variación alguna. Ver `24-end-to-end-journeys.md`, Journey 1.

### (b) Clientes: dos copias editables — P1

- `POSContext` lee clientes de `mock/customers.js` de forma estática
  (`POSContext.jsx:3`) y acumula los puntos ganados aparte, en
  `customerAdjustments`.
- `CRMContext` mantiene su propia copia de los mismos clientes
  (`CRMContext.jsx:33`), con notas, tags, consentimientos y saldo de puntos
  propio.
- `CustomerPickerModal` del POS importa `CUSTOMERS` del mock directamente
  (`CustomerPickerModal.jsx:4`), no del CRM.

Consecuencias: un cliente creado en el CRM no existe para el POS y no puede
asociarse a una venta; los puntos ganados en el POS no aparecen en la ficha
del CRM; los ajustes de puntos del CRM no se ven en el POS. Está reconocido
en el comentario de `CRMContext.jsx:23-27` como decisión de alcance, lo que lo
clasifica como `DOCUMENTED` además de `CONFIRMED`.

### (c) Stock: la venta no descuenta inventario — P1 (gap de diseño)

`InventoryContext.jsx:18-22` lo declara explícitamente: las ventas del POS no
descuentan stock. `inventoryConsumptionService` existe y calcula el consumo
teórico, pero sólo se usa para mostrar el costo en el detalle de venta. El
circuito producto to receta to insumo to stock está construido pero no está
conectado a la venta. Clasificación: `CODE_ONLY`.

## 2.6 Los dos relojes — P1

**CONFIRMED.** El sistema opera con dos nociones de "ahora" simultáneas:

| Reloj | Valor | Quién lo usa |
|---|---|---|
| `MOCK_NOW` (`mock/config.js:5`) | 16-sep-2026 20:30, fijo | toda la semilla mock y `dashboardService.js:12` |
| `new Date()` real | fecha real del sistema | POSContext, InventoryContext, CRMContext y `admin/utils/period.js:14` |

En la fecha de esta auditoría (19-sep-2026) la deriva ya es de 3 días y crece
un día por cada día que pasa.

Efectos confirmados en pantalla:

- El Dashboard muestra "Próximas reservas" con fechas del 16 y 17 de
  septiembre, es decir, en el pasado. Ver `evidence/02-admin-dashboard.png`.
- `VENTAS DE HOY` queda congelado en el 16-sep y nunca cambia, sin importar la
  fecha real ni las ventas reales registradas.
- Los filtros de período de Fase 5 (`periodRange()` en `admin/utils/period.js`)
  resuelven contra la fecha real, mientras los datos que filtran están
  anclados a `MOCK_NOW`. El filtro "Hoy" sobre datos mock devuelve vacío, y
  las ventanas de 7/30/90 días irán perdiendo registros a medida que la deriva
  crezca.

## 2.7 Integridad y concurrencia

**FACT** — el estado vive en la pestaña. No hay sincronización entre pestañas
(no se escucha el evento `storage`), ni entre dispositivos, ni tiempo real.

**INFERENCE · P1 para uso real** — dos pestañas abiertas del panel son dos
copias divergentes del estado. La última en escribir pisa a la otra por
completo, porque cada `setItem` serializa el estado entero, no un delta. En un
restaurante con POS y KDS en pantallas distintas —el caso de uso declarado del
producto— esto significa que el KDS no puede funcionar en otro dispositivo: no
vería las comandas del POS. No verificado con dos pestañas simultáneas
(`NOT_TESTED`), pero se deduce directamente del mecanismo de persistencia.

## 2.8 Generación de identificadores

Los tres contextos definen el mismo helper, duplicado y no compartido:

```js
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random()*1e6).toString(36)}`
```

**OBSERVED · P3** — la probabilidad de colisión es despreciable en un solo
dispositivo, pero no hay unicidad garantizada ni coordinación entre clientes.
Los contadores legibles (`saleSeq`, `orderSeq`, `purchaseSeq`) son locales a la
pestaña: dos dispositivos emitirían "Venta #0001" en paralelo.
