# DICTAMEN FORENSE CONSOLIDADO — ARBO OS

**Fecha del dictamen:** 19 de septiembre de 2026  
**Objetivo auditado:** ARBO OS (commit `52c01cb`) — Sistema de Gestión Gastronómica y Sitio Público  
**Naturaleza técnica:** SPA monolítica (React 19 + Vite 8 + Tailwind CSS v4) alojada en Vercel, sin backend ni base de datos, con persistencia en `localStorage`.  
**Metodología:** Auditoría forense estricta de sólo lectura. Cero mutaciones destructivas.

---

## 1. Resumen Ejecutivo y Dictamen Global

> [!CAUTION]
> ### Veredicto Forense: NO APTO PARA OPERACIÓN COMERCIAL REAL
> ARBO OS es una **maqueta interactiva avanzada de alta fidelidad visual y lógica de dominio sofisticada**, pero **carece de los cimientos indispensables para operar un negocio gastronómico en el mundo real**:
> 1. **No existe backend ni base de datos:** Opera 100% en el navegador del cliente con datos mock y `localStorage`.
> 2. **Ventas desconectadas del stock:** Vender 100 platos no descuenta un gramo de insumos en el inventario.
> 3. **Pérdida total de pedidos y reservas web:** Los formularios públicos confirman transacciones que descartan en memoria sin enviar ni registrar.
> 4. **Exposición crítica de seguridad:** `/admin` es de acceso público irrestricto en internet y expone datos personales (PII) de clientes en el bundle de descarga.
> 5. **Ilegalidad fiscal (Argentina):** Cero integración con AFIP/ARCA, sin facturación electrónica, CAE ni controladores fiscales.

A pesar de estas limitaciones estructurales, el proyecto presenta un **diseño de servicios y reglas de negocio sobresaliente** (`src/services/`): los algoritmos de costo promedio ponderado, dimensionamiento de unidades, lógica de comandas y segmentación son funciones puras listas para ser integradas a un backend relacional robusto.

---

## 2. Matriz General de Madurez por Módulo

| Módulo | Ruta Principal | Estado Metodológico | Hallazgo Principal |
|---|---|---|---|
| **Arquitectura & Core** | `/admin/*` | `PARTIAL` | SPA pura sin backend; 761 kB de bundle monolítico. |
| **Persistencia** | `localStorage` | `NOT_IMPLEMENTED` | Sin PostgreSQL; 3 contextos serializan todo en cada cambio. |
| **Seguridad & Auth** | `/admin` | `BROKEN` | Sin login, sin roles; `/admin` público en producción con PII expuesta. |
| **POS / Salón** | `/admin/pos` | `PARTIAL` | Cobro operativo en desktop; roto en mobile (BUG-007) y dinero bloqueado (BUG-003). |
| **Mesas & Órdenes** | `/admin/mesas` | `PARTIAL` | Apertura y cierre funcional; división de cuenta es solo calculadora (`UI_ONLY`). |
| **Cocina (KDS)** | `/admin/cocina` | `PARTIAL` | Partición por estaciones OK; comandas huérfanas tras cobro (BUG-004). |
| **Stock / Inventario** | `/admin/inventario` | `PARTIAL` | Compras y mermas mueven stock; **las ventas NO descuentan stock**. |
| **Recetas & Costos** | `/admin/costos` | `CONFIRMED_WORKING` | Food cost teórico y costo de recetas matemáticamente exactos. |
| **Compras & Proveedores** | `/admin/compras` | `PARTIAL` | Costo promedio ponderado verificado; desconectado de la caja registradora. |
| **Caja & Arqueos** | `/admin/caja` | `PARTIAL` | Apertura/cierre aritmético OK; **abrir turno destruye historial anterior** (BUG-018). |
| **Clientes & CRM** | `/admin/clientes` | `PARTIAL` | Segmentación y tags OK; **clientes de CRM invisibles en el POS** (BUG-006). |
| **ARBO Club** | `/admin/loyalty` | `PARTIAL` | Libro mayor de puntos OK; **canjes no pueden consumirse en el POS** (BUG-021). |
| **Marketing** | `/admin/marketing/campanas` | `UI_ONLY` / `SIMULATED` | Envíos y métricas son simulaciones con `Math.random()`; sin WhatsApp/Email. |
| **Facturación Fiscal** | — | `NOT_IMPLEMENTED` | Cero integración con AFIP/ARCA, sin CAE, sin comprobantes A/B/C. |
| **Multi-sucursal** | — | `NOT_IMPLEMENTED` | Diseñado para un solo local; sin depósitos múltiples ni transferencias. |
| **Sitio Público Transaccional** | `/pedidos`, `/reservas` | `BROKEN` | Formularios emiten falsas confirmaciones y descartan los datos (BUG-001, BUG-002). |

---

## 3. Registro de Defectos Críticos (Severidad P0 y P1)

```
[P0] BUG-001: Pedido online (/pedidos) genera ID aleatorio y borra el pedido en memoria.
[P0] BUG-002: Reserva (/reservas) emite confirmación falsa y descarta la reserva.
[P0] SEGURIDAD: /admin público sin autenticación desplegado en producción con 126 clientes expuestos.
[P1] BUG-003: Cancelar una comanda en cocina deja el ítem cobrándose y bloqueado en el POS.
[P1] BUG-004: Cobrar una mesa deja las comandas activas como huérfanas en el KDS de cocina.
[P1] BUG-005: El Dashboard principal ignora las ventas del POS y permanece congelado en datos mock.
[P1] BUG-006: Un cliente registrado en el CRM es completamente invisible para el cajero en el POS.
[P1] BUG-007: El POS es inusable en smartphones (0 px) y tablets verticales (84 px).
[P1] BUG-018: Abrir la caja registradora borra permanentemente todos los movimientos del turno anterior.
[P1] BUG-021: Los códigos de canje de ARBO Club (ARBO-XXXXX) no pueden cargarse en el POS.
[P1] BUG-024: El formulario de franquicias descarta silenciosamente los datos de inversores.
```

---

## 4. Brechas Esenciales de la Industria Gastronómica

1. **La Venta no descuenta Insumos:** El inventario no refleja la operación real; las alertas de desabastecimiento son ineficaces.
2. **Cero Trazabilidad Fiscal:** Inoperable bajo el marco legal argentino sin riesgo de clausura inmediata.
3. **Ausencia de Impresión Térmica:** Sin salida ESC/POS a comanderas de cocina o tickets de control.
4. **Desconexión entre Compras y Finanzas:** Recibir mercadería no impacta en los egresos de caja ni genera cuentas por pagar.
5. **Falta de Operatoria de Salón Real:** Imposible unir mesas, transferir consumos entre mesas o dividir cuentas por producto.

---

## 5. Hoja de Ruta de Mitigación y Migración

### Fase 1: Blindaje Inmediato (24 a 48 Horas)
1. **Activar Vercel Password Protection:** Restringir el acceso a `https://arbo-alpha.vercel.app/admin` con contraseña inmediata.
2. **Desviar Pedidos y Reservas a WhatsApp:** Reemplazar el checkout fantasma de `/pedidos` y `/reservas` por enlaces directos a `https://wa.me/...` con el texto preformateado del pedido/reserva para no perder ventas.
3. **Salida para Franquicias:** Conectar el formulario de `/franquicia` a Formspree o Resend.

### Fase 2: Plataforma Transaccional sobre Supabase (Semanas 1 a 4)
1. **Implementar Esquema Relacional:** Migrar el estado de `localStorage` al esquema PostgreSQL auditado en `27-target-architecture.md`.
2. **Supabase Auth & RLS:** Configurar roles (`admin`, `cajero`, `mozo`, `cocina`) y políticas de aislamiento de datos.
3. **Triggers de Consumo de Stock:** Conectar `sales` con `inventory_items` mediante triggers automáticos basados en las recetas existentes.
4. **Supabase Realtime en KDS y Mesas:** Eliminar divergencias entre terminales sincronizando comandas por WebSockets.

### Fase 3: Integración Operativa y Fiscal (Semanas 5 a 8)
1. **Facturación Electrónica AFIP:** Conectar Web Service WSFE para autorización de CAE y emisión de comprobantes fiscales obligatorios.
2. **Servidor de Impresión Local:** Implementar micro-servicio local para comandas térmicas ESC/POS.
3. **Módulo de Turnos Históricos:** Registrar cada apertura y cierre de caja con auditoría de diferencias y arqueo ciego.

---

## 6. Índice de Archivos de la Auditoría

Todos los capítulos de detalle, con evidencia en capturas de pantalla y citas de código fuente, se encuentran archivados en:

- [`00-index.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/00-index.md) — Índice maestro de trazabilidad.
- [`01-architecture.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/01-architecture.md) a [`28-open-questions.md`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/28-open-questions.md) — Los 28 capítulos temáticos completos.
- [`evidence/`](file:///c:/Users/Thiago/arbo/docs/research/arbo-os/evidence/) — 10 capturas de pantalla probatorias tomadas durante la auditoría forense.
