# 06 — KDS / Cocina

**Ruta:** `/admin/cocina` (KDS) y `/admin/comandas` (listado)
**Archivos:** `src/admin/pages/kitchen/KDS.jsx`, `src/services/kitchenService.js`,
`src/mock/kitchenConfig.js`, `src/mock/stations.js`
**Estado general:** `PARTIAL` — la mecánica interna es sólida; hay dos
defectos de integración (BUG-003, BUG-004) y una limitación arquitectónica
que impide su uso real (§6.6).

## 6.1 Modelo de comandas

`KITCHEN_TICKET_STATUSES = ['SENT', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']`

El archivo de configuración documenta dos recortes deliberados
(`kitchenConfig.js:6-13`): no hay `DRAFT` (enviar crea y envía en el mismo
paso) ni `ACCEPTED` (de `SENT` se pasa directo a `PREPARING` al tocar "Tomar").
Son decisiones explícitas, no omisiones.

Umbrales de demora (`kitchenConfig.js:40-43`): `WARNING` a los 6 min,
`DELAYED` a los 12 min, medidos desde `sentAt`.

Sectores (`mock/stations.js`): **bar** y **cocina** activos. El mapeo lo
define `STATION_BY_CATEGORY` en `mock/products.js`: café, vinos y bebidas van
a bar; el resto a cocina. Pastelería está mapeado a cocina con un comentario
que indica que su sector propio todavía no está activo.

## 6.2 Regla 1 orden → N comandas — `CONFIRMED_WORKING`

`buildTicketsFromOrder` (`kitchenService.js:37-58`) parte lo pendiente de una
orden por sector y emite una comanda por sector, con código `<nºorden>-<letra>`.

**Verificado en vivo:** orden #1 con `Tostón de Palta ×1` (cocina) y
`Copa Malbec ×2` (bar) generó exactamente dos comandas:

```json
[{"code":"1-A","station":"cocina","status":"SENT","items":["Tostón de Palta x1"]},
 {"code":"1-B","station":"bar","status":"SENT","items":["Copa Malbec Patagónico x2"]}]
```

El split por sector, la numeración por letra y el arrastre de mesa/orden
funcionan correctamente.

## 6.3 Envíos incrementales — `CONFIRMED_WORKING`

`buildPendingTicketItems` calcula `quantity - sentQty` por línea, de modo que
agregar un producto más a una mesa ya servida genera una comanda **nueva** en
lugar de mutar la que ya está en cocina. Es el comportamiento correcto para un
servicio real y está bien implementado.

## 6.4 Tablero KDS — `CONFIRMED_WORKING`

Tres columnas: **NUEVOS** / **EN PREPARACIÓN** / **LISTOS**, con pestañas por
sector y una fila de métricas (pendientes, preparando, listos, demorados,
promedio del día). Evidencia: `evidence/03-kds.png`.

- Transiciones `SENT → PREPARING → READY → DELIVERED`: cada una valida el
  estado de origen antes de aplicar (`POSContext.jsx:261-283`). No se pueden
  saltear pasos ni retroceder. Correcto.
- Cancelar comanda: modal con motivos predefinidos ("Cliente canceló",
  "Producto sin stock", "Error de carga", "Otro motivo"). Verificado: guarda
  `cancelReason`, `cancelledAt` y `cancelledBy`.
- Cronómetro por comanda (`ElapsedTimer`) con estado de demora.
- `calcOrderKitchenStatus` agrega el estado de la orden a partir de sus
  comandas activas, ignorando correctamente las canceladas.
- Layout específico: el `AdminLayout` detecta `/admin/cocina` y quita el
  padding estándar para que la pantalla se lea a distancia
  (`AdminLayout.jsx:37,78`). Buen detalle.

La configuración por defecto abre el sector **bar**; hay que cambiar de
pestaña para ver cocina. En una instalación real cada pantalla debería
recordar su sector — hoy no se persiste la selección.

## 6.5 Defectos de integración

- **BUG-003 (P1):** cancelar una comanda no libera la línea del pedido. El
  producto sigue cobrándose, no se puede eliminar ni reducir, y no se puede
  volver a enviar. Estado sin salida.
- **BUG-004 (P1):** cobrar una mesa no cierra sus comandas. Quedan vivas en el
  tablero con el cronómetro corriendo, apuntando a una orden ya borrada.
  Verificado: tras la venta #0001, `#1-A` seguía en "NUEVOS · 1" rotulada
  "Mesa 1". Evidencia: `evidence/05-bug-comanda-huerfana-tras-cobro.png`.
- **Reimpresión:** `reprintTicket` sólo incrementa un contador `reprints` en la
  comanda. No hay hardware ni driver de impresión. `UI_ONLY`, y el propio
  código lo documenta (`POSContext.jsx:293-294`).

## 6.6 Limitación arquitectónica: el KDS no puede correr en otra pantalla

**INFERENCE · crítica para el caso de uso.** El estado vive en el
`localStorage` de la pestaña y no hay sincronización entre pestañas
(no se escucha el evento `storage`), ni servidor, ni tiempo real.

Un KDS es, por definición, **una segunda pantalla**: la cocina mira un monitor
mientras el mozo carga desde otro dispositivo. Con la arquitectura actual esa
segunda pantalla **no vería ninguna comanda**, porque el `localStorage` de un
dispositivo no llega al otro.

Hoy el KDS sólo funciona como otra pestaña del mismo navegador, en la misma
máquina — y ni siquiera eso está garantizado, porque dos pestañas mantienen
copias divergentes y la última en escribir pisa a la otra (ver `02-database.md` §2.7).

No se verificó empíricamente con dos dispositivos (`NOT_TESTED`), pero se
deduce directamente del mecanismo de persistencia. Es la limitación que más
condiciona el uso productivo del módulo.

## 6.7 Manejo de errores de red

`NOT_APPLICABLE` — no hay red. No existe estado offline, ni reintentos, ni
cola de sincronización, porque no hay nada que sincronizar.
