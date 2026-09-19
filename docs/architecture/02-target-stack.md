# 02 — TARGET TECHNOLOGY STACK

---

## 1. VISIÓN GENERAL DEL STACK OBJETIVO

El stack tecnológico objetivo de ARBO OS se selecciona bajo criterios de **velocidad de ejecución, integridad transaccional, tipado estricto de punta a punta y resiliencia operativa**, evitando tecnologías experimentales o dependencias propietarias innecesarias.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARBO OS TARGET TECH STACK                       │
├───────────────────┬────────────────────┬───────────────────────────────┤
│ FRONTEND LAYER    │ APPLICATION & API  │ PERSISTENCE & INFRASTRUCTURE  │
│ - React 19 + Vite │ - Node.js / Deno   │ - PostgreSQL 16+ (Supabase)   │
│ - TypeScript 5.5+ │ - Supabase Auth    │ - Row Level Security (RLS)    │
│ - Tailwind CSS v4 │ - Edge Functions   │ - S3 Storage (Comprobantes)   │
│ - TanStack Query  │ - Realtime CDC     │ - Redis / Upstash (Workers)   │
│ - Zustand + IDB   │ - Background Jobs  │ - Pino + Sentry (Observab.)   │
└───────────────────┴────────────────────┴───────────────────────────────┘
```

---

## 2. FRONTEND ARCHITECTURE

### 2.1. Framework Base: React 19 + Vite
- **Por qué:** React es el estándar de la industria y la base sobre la que ARBO ya tiene un catálogo extenso de componentes de interfaz (`src/components/`, `src/pages/`). Vite proporciona empaquetado ultra-rápido, Hot Module Replacement (HMR) instantáneo y soporte nativo para ES Modules.
- **Transición a TypeScript (Strict Mode):** Todo el código de frontend debe migrar a `.tsx` y `.ts` con tipado estricto. En gastronomía, un `amount: null` o un `unit_cost: undefined` arruina el arqueo de caja o el cálculo de recetas; TypeScript elimina esta clase de errores en tiempo de compilación.

### 2.2. Diseño, Estética y Ergonometría: Tailwind CSS v4 + Framer Motion
- **Por qué:** La identidad visual de ARBO es uno de sus principales activos competitivos frente a interfaces legacy como Fudo (`[FACT: docs/research/fudo-vs-arbo/08-ux-responsive-accessibility.md]`). Tailwind CSS v4 ofrece un motor de alto rendimiento con variables nativas de CSS, y Framer Motion asegura micro-animaciones fluidas para transiciones de tickets en el KDS y cambios de estado de mesas.

### 2.3. Gestión de Estado: Separación entre Estado Servidor y Estado UI
La arquitectura anterior sobrecargaba Contextos de React (`InventoryContext`, `ClientContext`) con datos en memoria que no sincronizaban bien. La nueva arquitectura divide el estado en dos niveles:
1. **Server State (TanStack Query / React Query v5):**
   - Maneja la caché de datos remotos, revalidación en background, deduplicación de consultas y mutaciones optimistas.
   - Si se edita un ingrediente o entra una comanda, TanStack Query invalida automáticamente las claves de consulta correspondientes.
2. **Client / Transient State (Zustand):**
   - Maneja exclusivamente el estado efímero del dispositivo: carrito activo en el POS, modal abierto, filtros de búsqueda, selección de mesa activa y modo offline.
   - Integración con **IndexedDB (vía idb-keyval / Dexie.js)** para persistir el carrito del POS y los tickets encolados en caso de corte de energía o desconexión.

---

## 3. BACKEND & PERSISTENCIA

### 3.1. Motor Relacional Primario: PostgreSQL 16+
- **Por qué es irremplazable:** El modelo gastronómico es inherentemente relacional. Un plato tiene ingredientes; un ingrediente tiene compras; una compra tiene proveedores; una orden tiene items, pagos y movimientos de stock. Intentar resolver esto con NoSQL genera inconsistencias letales de inventario.
- **Capacidades PostgreSQL aprovechadas:**
  - **Transacciones ACID:** `BEGIN ... COMMIT` para garantizar que una orden no se guarde si falla el descuento de stock.
  - **Row Level Security (RLS):** Filtrado multi-tenant nativo a nivel de motor de base de datos.
  - **Constraints de Integridad:** Claves foráneas estrictas, `CHECK (quantity >= 0)`, unicidad compuesta y tipos `UUID`.
  - **Funciones Almacenadas (PL/pgSQL):** Para operaciones atómicas de alta frecuencia como la explosión de recetas y el cálculo de balances de saldo.

### 3.2. Plataforma de Servicios: Supabase (BaaS & Infraestructura)
- **Supabase Auth:** Autenticación robusta basada en GoTrue con emisión de tokens JWT firmados, manejo de refresh tokens y roles de usuario.
- **Supabase Realtime:** Transmisión de cambios de base de datos (CDC sobre PostgreSQL Logical Replication / WAL) a clientes conectados vía WebSockets.
- **Supabase Storage:** Buckets seguros compatibles con S3 para almacenar fotos de platos en alta resolución, comprobantes de pago escaneados y facturas de compra.
- **Supabase Edge Functions (Deno / TypeScript):** Para ejecutar código de servidor liviano con baja latencia cerca del usuario (ej. webhooks de MercadoPago, autorizaciones AFIP).

### 3.3. Orquestador de Tareas y Colas en Background (Workers)
- **Por qué Supabase solo no alcanza:** Tareas como el recálculo diario de Food Cost, la evaluación nocturna de segmentos de clientes, el reintento de comprobantes fiscales caídos y el envío de campañas de WhatsApp requieren un procesador de colas en segundo plano confiable.
- **Solución:** Worker service liviano sobre Node.js utilizando **BullMQ / Upstash Redis** o **pg_cron / Supabase Scheduled Functions** con reintentos exponenciales y dead-letter queues.

---

## 4. REALTIME ARCHITECTURE

- **Canales de Sincronización:**
  - `branch-kds:{branch_id}`: Transmite eventos `ticket.created`, `ticket.item_status_changed`, `ticket.completed`.
  - `branch-floor:{branch_id}`: Transmite eventos `table.status_changed`, `table.bill_requested`.
- **Garantías:** Conexión persistente WebSocket con mecanismo de heartbeat (ping/pong). Si la conexión cae por más de 10 segundos, el cliente conmuta automáticamente a un modo de polling de contingencia cada 5 segundos y muestra un indicador visual en pantalla.

---

## 5. OBSERVABILIDAD, LOGGING & TELEMETRÍA

- **Structured Logging (Pino):** Todos los servicios de servidor emiten logs en formato JSON estructurado con `timestamp`, `level`, `organization_id`, `branch_id`, `user_id`, `trace_id` y `event_type`.
- **Error Tracking (Sentry):** Captura centralizada de excepciones de frontend y backend con stack traces completos, contexto del usuario y versión del release.
- **Métricas de Rendimiento (PostgreSQL pg_stat_statements):** Monitoreo continuo de consultas lentas (`slow queries`), consumo de conexiones del pooler (Supabase Transaction Pooler / PgBouncer) y latencia p95/p99.
