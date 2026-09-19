# FINAL ARBO OS TARGET ARCHITECTURE & TECHNICAL BLUEPRINT
## Dictamen Técnico Maestro y Blueprint de Ingeniería de Software

---

### METADATOS TÉCNICOS
- **Documento:** `FINAL-ARBO-OS-TARGET-ARCHITECTURE.md`
- **Ubicación Oficial:** `docs/architecture/` y `public/`
- **Fecha de Aprobación del Blueprint:** 19 de Septiembre de 2026
- **Estado:** BLUEPRINT ARQUITECTÓNICO CERRADO Y VALIDADO
- **Trazabilidad Forense y Estratégica:**
  - Auditoría Forense ARBO OS (`docs/research/arbo-os/` - 28 Capítulos)
  - Auditoría Forense Fudo (`C:\docs\research\fudo\` - 24 Fases)
  - Auditoría Comparativa Fudo vs ARBO (`docs/research/fudo-vs-arbo/` - 12 Capítulos)
  - Estrategia de Producto ARBO OS (`docs/product-strategy/` - 18 Capítulos)
- **Principio Rector Absoluto:** Cero código provisional, cero implementación viva. Este documento es el plano maestro de ingeniería sobre el cual se ejecutará la construcción definitiva del sistema.

---

## 1. RESUMEN EJECUTIVO DE ARQUITECTURA

La auditoría forense determinó que ARBO OS poseía una discrepancia insostenible: **una interfaz visual de vanguardia y servicios matemáticos puros impecables montados sobre una persistencia ficticia (`localStorage`)**, con rutas administrativas desprotegidas y sin integridad transaccional (`P0-GAP-02`, `BUG-001` a `BUG-021`).

Simultáneamente, el análisis del competidor líder (**Fudo**) demostró los riesgos de una arquitectura legacy: bases de datos relacionales rígidas con sucursales como silos inconexos sin transferencias de stock, paquetes JavaScript de más de 2.3 MB para leer un simple menú QR, comisiones extractivas (1.9% + IVA) y un sistema cerrado sin fidelización.

**ARBO OS Target Architecture** redefine por completo la infraestructura del sistema:
1. **Núcleo Relacional Transaccional:** Sustitución total de `localStorage` por **PostgreSQL 16+** con garantías ACID absolutas y Row Level Security (RLS) nativo.
2. **Arquitectura Multi-Tenant & Multi-Sucursal Día 1:** Esquema jerárquico (`organizations` -> `branches` -> `warehouses`) que aísla los datos a nivel de motor SQL.
3. **Integridad de Datos Inmutable (Ledgers):** Dinero en caja (`cash_movements`), materias primas (`inventory_movements`) y fidelización (`loyalty_transactions`) se gestionan exclusivamente mediante estructuras **Append-Only**.
4. **Resiliencia Operativa Offline-First:** PWA con IndexedDB para que el salón, mostrador y cocina sigan despachando comida ante cortes de internet.
5. **Separación Estricta de Capas (Clean Architecture):** Los comensales navegan una web pública ultraliviana (<300 KB) sin acceso a código administrativo ni credenciales de backend.

---

## 2. LOS 10 PRINCIPIOS ARQUITECTÓNICOS RECTORES

1. **Transactional Integrity:** Dinero, ventas, descarga de recetas y puntos corren bajo bloques ACID atómicos (`BEGIN ... COMMIT`).
2. **Server Authority:** El navegador web nunca es fuente de verdad; el backend valida precios, existencias y permisos.
3. **Multi-Tenant by Design:** Clave `organization_id` obligatoria y políticas RLS activas en el 100% de las tablas.
4. **Multi-Branch by Design:** Sucursales y depósitos interconectados con soporte nativo de transferencias de stock.
5. **Auditability:** Prohibición de `UPDATE` o `DELETE` sobre libros mayores; las correcciones son transacciones compensatorias.
6. **Realtime Where Needed:** WebSockets restringidos a KDS y Salón; consultas administrativas vía REST cacheado.
7. **Offline / Degraded Operation:** POS y Mesas operan en modo contingencia local ante pérdida de conectividad.
8. **Security by Default:** Zero Trust. La ruta `/admin` está blindada en servidor y rechaza accesos no autenticados.
9. **Domain Separation:** Lógica matemática de negocio pura (fichas técnicas, márgenes, PPP) desacoplada de React y de la base de datos.
10. **Evolvability:** Adaptadores desacoplados (Hexagonal) para pasarelas de pago, organismos fiscales (AFIP) e impresoras.

---

## 3. TARGET STACK DEFINITIVO

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARBO OS TARGET TECH STACK                       │
├───────────────────┬────────────────────┬───────────────────────────────┤
│ FRONTEND LAYER    │ APPLICATION & API  │ PERSISTENCE & INFRASTRUCTURE  │
│ - React 19 + Vite │ - Node.js Runtime  │ - PostgreSQL 16+ (Supabase)   │
│ - TypeScript 5.5+ │ - Supabase Auth    │ - Row Level Security (RLS)    │
│ - Tailwind CSS v4 │ - Edge Functions   │ - S3 Bucket (Comprobantes)    │
│ - TanStack Query  │ - Supabase Realtime│ - Redis / BullMQ (Colas async)│
│ - Zustand + IDB   │ - Transactional Out│ - Pino JSON + Sentry (Telemet)│
└───────────────────┴────────────────────┴───────────────────────────────┘
```

---

## 4. MODELO DE DATOS POSTGRESQL (SÍNTESIS DE DOMINIOS)

El esquema relacional formal comprende 8 dominios normalizados con claves primarias `UUID v4`:

```
1. TENANCY & USERS: organizations, branches, warehouses, user_profiles, user_memberships (RBAC).
2. CATÁLOGO & RECETAS: categories, products, product_variants, modifier_groups, modifiers, ingredients, recipes, recipe_items.
3. INVENTARIO & COMPRAS: inventory_movements (Ledger Inmutable), suppliers, purchase_invoices, purchase_items, stock_transfers.
4. VENTAS & SALÓN: tables, table_sessions, orders, order_items, payments.
5. CONTROL DE CAJA: cash_registers, cash_shifts, cash_movements (Ledger Inmutable).
6. COCINA & DESPACHO: kitchen_tickets, station_routing (Barra vs Cocina).
7. RETENCIÓN & CLIENTES: customers, loyalty_transactions (Ledger Inmutable), loyalty_tiers, customer_segments.
8. COMERCIO PÚBLICO & FISCAL: online_orders, reservations, fiscal_documents (AFIP CAE), audit_logs.
```

---

## 5. PIPELINE TRANSACCIONAL DE VENTA Y EXPLOSIÓN DE RECETAS

Al momento de cobrar una orden en el mostrador o salón:
1. Se valida el encabezado `Idempotency-Key: <UUID>` para prevenir cobros duplicados.
2. Se abre un bloque transaccional atómico en PostgreSQL:
   - `UPDATE orders SET status = 'SETTLED'`.
   - `INSERT INTO payments (...)`.
   - `INSERT INTO cash_movements (...)` (asiento en la caja del turno abierto).
   - Invocación de `fn_deplete_order_inventory(order_id)`: explosión de recetas y descarga de materias primas en `inventory_movements` aplicando factores de merma y sustituciones.
   - `INSERT INTO loyalty_transactions (...)` (acreditación de puntos en ARBO Club).
3. Se ejecuta el `COMMIT` en base de datos.
4. El Transactional Outbox Relay despacha asíncronamente:
   - Evento WebSocket al KDS para archivar el ticket de cocina.
   - Petición de CAE a la capa fiscal AFIP (con cola de contingencia en caso de timeout).
   - Actualización de segmentación en el CRM.

---

## 6. CONTROL DE CAJA Y RESOLUCIÓN DE BUGS HISTÓRICOS

- **Resolución de BUG-018 (Inmutabilidad de Caja):** La tabla `cash_movements` es append-only. Reabrir una caja nunca destruye movimientos históricos; genera un evento auditado de reapertura y asientos compensatorios con motivo obligatorio.
- **Protocolo de Arqueo Ciego:** El cajero ingresa el conteo físico de billetes y cupones a ciegas. El servidor calcula el saldo teórico y la discrepancia (`declared - theoretical`), registrándola con alerta si supera la tolerancia.
- **Resolución de BUG-003 y BUG-004 (Sincronización KDS/POS):** Las cancelaciones en cocina actualizan inmediatamente la comanda en base de datos descontando el ítem facturable, y el cobro en caja archiva automáticamente los tickets de preparación.
- **Resolución de BUG-021 (Canje de Puntos en POS):** El checkout del POS cuenta con selector modal de recompensas que descuenta el valor del premio del ticket y debita los puntos del ledger de ARBO Club en la misma transacción de pago.
- **Resolución de BUG-001 y BUG-002 (Persistencia Pública):** Los pedidos online y las reservas web se persisten formalmente en PostgreSQL vinculados al `branch_id`, eliminando el descarte en memoria.

---

## 7. MATRIZ DE DEGRADACIÓN ANTE FALLOS (RESILIENCIA OFFLINE)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CONTINUIDAD ANTE CORTES DE INTERNET                  │
├───────────────────────────────┬────────────────────────────────────────┤
│ MÓDULOS QUE CONTINÚAN OFFLINE │ - POS Mostrador y Toma de Mesas en PWA │
│ (Must Continue Offline)       │ - Cobro en efectivo con arqueo ciego   │
│                               │ - Salida de comandas por LAN a comander│
│                               │ - Encolado en IndexedDB con UUIDs v4   │
├───────────────────────────────┼────────────────────────────────────────┤
│ MÓDULOS QUE DEGRADAN          │ - Facturación AFIP (comprobante provis)│
│ (Can Degrade Gracefully)      │ - ARBO Club (puntos encolados para sync│
│                               │ - Descarga de Stock (procesada al recon│
├───────────────────────────────┼────────────────────────────────────────┤
│ MÓDULOS QUE SE DETIENEN       │ - Pedidos delivery de comensales web   │
│ (Must Stop Inevitably)        │ - Pagos online por webhook MercadoPago │
│                               │ - Reservas remotas desde el exterior   │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 8. GRAFO TOPOLÓGICO DE IMPLEMENTACIÓN TÉCNICA

```
[1. Persistencia & Tenancy Base (PostgreSQL, Supabase, RLS)]
                         │
                         ▼
[2. Catálogo, Insumos & Recetas (Fichas Técnicas, PPP, Costos)]
                         │
                         ▼
[3. Núcleo Transaccional de Ventas & Caja (Órdenes, Mesas, Pagos)]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[4. KDS Realtime Cocina]        [5. Motor de Inventario (Explosión)]
        │                                 │
        └────────────────┬────────────────┘
                         ▼
[6. Retención, CRM & ARBO Club Integrado al POS]
                         │
                         ▼
[7. Comercio Público (Menú QR, Tienda Delivery sin %, Reservas)]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[8. Capa Fiscal Argentina (AFIP)] [9. Automatizaciones & Alertas]
        │                                 │
        └────────────────┬────────────────┘
                         ▼
[10. Escala Multi-Sucursal (Transferencias de Stock entre Depósitos)]
```

---

## 9. CONFIRMACIÓN DIRECTIVA DE CIERRE DE ARQUITECTURA

1. **Estado del Código Fuente:** Se confirma formalmente que **NO se ha modificado una sola línea de código en `src/`**, no se han instalado dependencias en `package.json`, ni se han alterado bases de datos ni servicios de producción.
2. **Completitud del Blueprint:** Los 26 capítulos técnicos de `docs/architecture/` definen con precisión de grado militar cada interfaz, esquema DDL, contrato de API, flujo transaccional y política de seguridad requerida.
3. **Transición a Fase de Ejecución:** El proyecto dispone ahora del diseño técnico completo para iniciar la implementación de la Fase 1 (Persistencia, Supabase y Tenancy Base).

---

# ARCHITECTURE COMPLETE — READY FOR IMPLEMENTATION
