# ARBO OS — IMPLEMENTATION GATE & READINESS VERDICT

---

### METADATOS DEL GATE
- **Documento:** `IMPLEMENTATION-GATE.md`
- **Ubicación:** `docs/architecture/IMPLEMENTATION-GATE.md` y `public/IMPLEMENTATION-GATE.md`
- **Fecha de Evaluación:** 19 de Septiembre de 2026
- **Estado de Decisión:** **APPROVED WITH CONDITIONS**
- **Propósito:** Actuar como compuerta técnica formal de pase a producción/desarrollo antes de escribir una sola línea de código en `src/`.

---

## 1. APPROVED (Decisiones Técnicas Aprobadas Sin Reservas)

Las siguientes definiciones de arquitectura han sido verificadas, son internamente consistentes y están listas para su construcción directa:

1. **Stack Tecnológico Base:**
   - PostgreSQL 16+ con Row Level Security (RLS) habilitado en el 100% de las tablas.
   - React 19 + Vite + TypeScript (Strict Mode) para frontend.
   - TanStack Query v5 para Server State + Zustand para UI efímera + Dexie.js (IndexedDB) para persistencia local.
   - Tailwind CSS v4 y Framer Motion preservados íntegramente del prototipo actual.
2. **Modelo Multi-Tenant Jerárquico Día 1:**
   - Aislamiento en PostgreSQL mediante `organization_id UUID NOT NULL` y `branch_id UUID`.
   - Inyección de contexto de seguridad a través de claims firmados en Supabase Auth (`auth.jwt()`).
   - Mapeo estricto de roles (RBAC): Owner, Admin, Manager, Cashier, Waiter, Kitchen, Accountant.
3. **Libros Mayores Inmutables (Append-Only):**
   - Prohibición total de `UPDATE` y `DELETE` en `cash_movements`, `inventory_movements` y `loyalty_transactions`.
   - Correcciones monetarias y de existencias gestionadas exclusivamente mediante transacciones compensatorias auditadas.
4. **Pipeline de Transacciones de Venta ACID:**
   - Transacción atómica en PostgreSQL: cobro, movimiento de caja, descarga de stock por receta y acreditación de puntos.
   - Inclusión obligatoria del encabezado `Idempotency-Key: <UUID>` en comandos de cobro y mutaciones críticas.
5. **KDS Desacoplado y Persistido en Base de Datos:**
   - El estado de la cocina reside exclusivamente en base de datos (`orders`, `order_items`). Las pantallas son clientes reactivos suscritos a WebSockets CDC con fallback automático a polling HTTP cada 5s.
6. **Manejo Numérico de Moneda y Costos:**
   - Prohibición absoluta de tipos de punto flotante (`FLOAT`, `REAL`).
   - Uso estricto de `NUMERIC(12, 2)` para moneda (ARS) y `NUMERIC(12, 4)` para cantidades de insumos y costos unitarios PPP.

---

## 2. BLOCKED (Bloqueos Técnicos Absolutos)

Las siguientes iniciativas quedan **estrictamente bloqueadas** y no deben implementarse en las primeras fases:

1. **Offline-First Bidireccional Completo para Salón y Mesas:**
   - *Motivo del Bloqueo:* Sincronizar estados de mesas concurrentes (ej. dos mozos adicionando platos a la misma mesa offline) introduce resolución de conflictos vectoriales (CRDTs) de altísima complejidad innecesaria para el MVP.
   - *Condición de Desbloqueo:* En MVP, el modo offline se restringe exclusivamente al **POS de Mostrador/Takeaway en efectivo**. Salón/Mesas exige red LAN local o conexión online.
2. **Facturación Fiscal AFIP Automática Sincrónica Bloqueante:**
   - *Motivo del Bloqueo:* Acoplar la confirmación de la venta en el salón a la respuesta de los servidores de AFIP detiene el restaurante ante las frecuentes caídas del fisco argentino.
   - *Condición de Desbloqueo:* El cobro en caja debe completarse siempre a nivel local; la fiscalización se desacopla mediante cola asíncrona.
3. **Migración de Datos de Clientes y Ventas de `localStorage`:**
   - *Motivo del Bloqueo:* Los datos actuales en `localStorage` son sintéticos, no normalizados y carecen de IDs relacionales válidos (`[FACT]`).
   - *Condición de Desbloqueo:* Se descartan; solo se migra el catálogo de productos y recetas como archivo semilla SQL (`seed.sql`).

---

## 3. EXTERNAL VALIDATION REQUIRED (Requiere Validación Externa)

1. **Régimen de Contingencia Fiscal de Facturación AFIP / ARCA:**
   - *Supuesto Técnico:* Emitir un comprobante interno provisorio con QR si AFIP no responde y tramitar el CAE en diferido dentro de las 24 horas.
   - *Acción Requerida:* **Validación contable y legal externa**. Se requiere dictamen de un contador matriculado argentino para confirmar si el cliente piloto encuadra en Régimen de Emisión en Línea con contingencia de Factura Manual (CAEA / Comprobante de respaldo talonario) o si el piloto inicial puede operar legalmente con Comprobante Interno X de control operativo.
2. **Integración Hardware de Impresoras Térmicas ESC/POS:**
   - *Decisión de Negocio:* Determinar si el local piloto cuenta con impresoras conectadas por red Ethernet (TCP/IP socket puerto 9100) o si exige impresoras USB locales que requieran un servicio agente ligero (Desktop Bridge en Node/Go).

---

## 4. TECHNICAL DEBT ACCEPTED (Deuda Técnica Aceptada Conscientemente)

Para acelerar la salida al mercado del MVP sin comprometer la solidez estructural, se acepta conscientemente la siguiente deuda técnica temporal:

1. **Stock Negativo Temporal Permitido:**
   - Si la receta demanda 200g de café y el sistema marca existencias en 0g, la venta se autoriza y el stock queda en `-0.200 kg`, emitiendo una alerta de inventario. Se acepta para no trabar el servicio en hora pico; se compensa al día siguiente mediante ajuste manual auditado.
2. **Sub-recetas de Un Solo Nivel de Profundidad en MVP:**
   - Las fichas técnicas soportarán recetas simples y sub-recetas de nivel 1 (ej. Salsa -> Tomates/Cebolla). Sub-recetas anidadas recursivas de 3+ niveles se postergan para V1.
3. **Cálculo Sincrónico de Puntos en Lugar de Event Bus Distribuido:**
   - En el MVP, la acreditación de puntos de ARBO Club se ejecuta dentro de la misma transacción PostgreSQL de cobro de la orden, evitando montar infraestructura de mensajería distribuida (Kafka/RabbitMQ) antes de tiempo.

---

## 5. FIRST IMPLEMENTATION PHASE (Fase Inicial de Implementación)

### FASE 1: FOUNDATION, TENANCY & PERSISTENCIA RELACIONAL
- **Objetivo:** Establecer la base de datos PostgreSQL en Supabase, ejecutar migraciones iniciales DDL, configurar autenticación segura con JWT y activar políticas Row Level Security (RLS).
- **Módulos:** Auth, Users, Organizations, Branches, Warehouses.
- **Tablas a Crear:** `organizations`, `branches`, `warehouses`, `user_profiles`, `user_memberships`.
- **Criterio de Aceptación:**
  - Creación de dos organizaciones de prueba con usuarios de distintos roles.
  - Comprobación empírica mediante pruebas automatizadas de que un usuario de la *Org A* no puede leer registros de la *Org B* (RLS estricto).

---

## 6. FIRST VERTICAL SLICE (Primer Flujo End-to-End Operativo)

El primer objetivo de software funcional no será una pantalla aislada, sino el **ciclo transaccional completo del restaurante** ejecutándose de punta a punta:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     EL PRIMER VERTICAL SLICE REAL                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. SETUP:                                                              │
│    - Cargar Insumo: 'Café Grano Especialidad' (Costo PPP: $15.000/kg)  │
│    - Cargar Stock Inicial: 5.000 kg en Depósito Barra.                 │
│    - Crear Ficha Técnica: 'Espresso Doble' (Consume 18g de café).      │
│    - Abrir Turno de Caja con Fondo Inicial de $10.000 ARS en efectivo. │
├────────────────────────────────────────────────────────────────────────┤
│ 2. EJECUCIÓN DEL SERVICIO:                                             │
│    - Cajero carga '1 Espresso Doble' en el POS ($3.500 ARS).           │
│    - KDS de Barra recibe la comanda vía WebSockets y la marca 'Listo'. │
│    - Cajero cobra en efectivo $3.500 ARS.                              │
├────────────────────────────────────────────────────────────────────────┤
│ 3. VERIFICACIÓN ATÓMICA:                                               │
│    - Stock de 'Café Grano' en base de datos: EXACTAMENTE 4.982 kg.     │
│    - Saldo Teórico en Caja: EXACTAMENTE $13.500 ARS.                   │
│    - Food Cost del plato calculado: $270 ARS (7.71% de Food Cost).     │
│    - Puntos ARBO Club acreditados al cliente: 35 puntos.               │
│    - Ticket en KDS pasa a estado 'ARCHIVED'.                           │
└────────────────────────────────────────────────────────────────────────┘
```

Si este flujo se ejecuta sin errores en una base de datos real con RLS, el núcleo operativo de ARBO OS estará validado y listo para expandirse a salón, delivery y fiscalidad.

---

### VEREDICTO FORMAL
```
═══════════════════════════════════════════════════════════════════════
  ESTADO DE COMPUERTA: APPROVED WITH CONDITIONS
  CONDICIÓN CLAVE:     Validar contingencia fiscal con contador y
                       restringir offline al POS mostrador en efectivo.
  PASO SIGUIENTE:      Esperar autorización humana para iniciar Fase 1.
═══════════════════════════════════════════════════════════════════════
```
