# FINAL ARBO OS ARCHITECTURE REVIEW & READINESS AUDIT

---

### METADATOS TÉCNICOS
- **Documento:** `FINAL-ARBO-OS-ARCHITECTURE-REVIEW.md`
- **Ubicación:** `docs/architecture/` y `public/`
- **Fecha de Dictamen:** 19 de Septiembre de 2026
- **Estado:** REVISIÓN TÉCNICA MAESTRA COMPLETADA
- **Fuentes Auditadas:**
  - Auditoría Forense ARBO OS (`docs/research/arbo-os/`)
  - Auditoría Forense Fudo (`C:\docs\research\fudo\`)
  - Auditoría Comparativa Fudo vs ARBO (`docs/research/fudo-vs-arbo/`)
  - Product Strategy ARBO OS (`docs/product-strategy/`)
  - Target Architecture ARBO OS (`docs/architecture/`)
- **Regla Metodológica Absoluta:** Cero código, cero creación de tablas o dependencias. Análisis crítico riguroso de viabilidad técnica antes del pase a desarrollo.

---

## 1. EXECUTIVE SUMMARY (RESUMEN EJECUTIVO)

La arquitectura técnica diseñada para ARBO OS ha sido sometida a una revisión forense exhaustiva para validar su consistencia interna, factibilidad técnica y ausencia de contradicciones antes de permitir la escritura de código en `src/`.

**El veredicto técnico es: APPROVED WITH CONDITIONS (APROBADO CON CONDICIONES).**

El blueprint propuesto resuelve con éxito los grandes defectos del prototipo anterior (erradicando la volatilidad de `localStorage`, blindando la ruta `/admin` con autenticación en servidor y resolviendo los bugs críticos `P0-GAP-02` e históricos `BUG-001` a `BUG-021`). Sin embargo, esta revisión identificó **3 desajustes críticos de dependencias y supuestos que debían corregirse**:
1. **La Paradoja de Dependencia Ventas vs Inventario:** El roadmap inicial colocaba el módulo de Inventario (Fase 5) posterior a Ventas y Caja (Fase 3). En un restaurante real, una venta transaccional no puede cobrar sin saber qué descontar del stock por receta; la persistencia del inventario debe nacer integrada en el núcleo transaccional.
2. **Sobreingeniería de Offline-First en Salón:** Pretender resolver sincronización offline bidireccional en mesas y KDS con múltiples mozos añade complejidad extrema innecesaria para el MVP. Se acota el offline exclusivamente al **POS de mostrador en efectivo**.
3. **Supuesto de Contingencia Fiscal AFIP:** El plan asumía como legal emitir comprobantes provisorios y tramitar el CAE después. Se reclasifica formalmente como **EXTERNAL VALIDATION REQUIRED**, exigiendo dictamen contable antes del despliegue comercial.

---

## 2. CONFLICTOS ARQUITECTÓNICOS IDENTIFICADOS (ARCHITECTURAL CONFLICTS)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   MATRIZ DE CONFLICTOS Y RESOLUCIÓN                    │
├─────────────────────┬──────────────────┬───────────────────────────────┤
│ CONFLICTO DETECTADO │ ORIGEN           │ RESOLUCIÓN TÉCNICA APLICADA   │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ 1. Ventas sin Stock │ Roadmap prelim.  │ Reordenamiento: el motor de   │
│    previo en Fases  │ separaba Ventas  │ inventario y fichas técnicas  │
│                     │ de Inventario    │ se fusiona en el núcleo de V1.│
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ 2. Offline total vs │ Arquitectura PWA │ Restricción: Salón exige red  │
│    KDS multi-pant.  │ asumía offline en│ LAN; offline solo para POS    │
│                     │ todos los módulos│ Mostrador en efectivo.        │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ 3. CAE AFIP diferido│ Supuesto técnico │ Reclasificado como "Requiere  │
│    asumido legal    │ no validado por  │ Validación Externa Contable". │
│                     │ profesional      │ Se prevé Comprobante X piloto.│
└─────────────────────┴──────────────────┴───────────────────────────────┘
```

---

## 3. CORRECCIÓN DEL GRAFO DE DEPENDENCIAS (DEPENDENCY CORRECTIONS)

### El Error del Roadmap Preliminar
El orden original contemplaba:
$$\text{Fase 2: Catálogo} \longrightarrow \text{Fase 3: Ventas \& Caja} \longrightarrow \text{Fase 4: KDS} \longrightarrow \text{Fase 5: Inventario}$$
**Falla técnica:** Si la Fase 3 se construye sin la tabla `inventory_movements` ni la función de explosión de recetas, la venta volvería a operar como en el prototipo (`InventoryContext.jsx:18-22`), cobrando sin descontar materias primas.

### El Orden Topológico Corregido y Definitivo
```
FASE 1: Persistencia & Tenancy Base (PostgreSQL, Supabase Auth, RLS)
   ↓
FASE 2: Catálogo, Fichas Técnicas & Stock Inicial (Insumos, Recetas, PPP, Depósitos)
   ↓
FASE 3: Núcleo Transaccional Unificado (POS, Salón, Caja, Explosión de Recetas ACID)
   ↓
FASE 4: KDS Realtime Cocina (WebSockets CDC por Estación)
   ↓
FASE 5: Retención, CRM & ARBO Club Integrado al POS (Canje de Puntos en Cobro)
   ↓
FASE 6: Comercio Público (Menú QR, Tienda Delivery sin %, Reservas Web)
   ↓
FASE 7: Capa Fiscal Argentina & Automatizaciones (AFIP WSFE y Workers)
   ↓
FASE 8: Escala Multi-Sucursal (Transferencias de Stock entre Depósitos)
```

---

## 4. REVISIÓN CRÍTICA DE LA ESTRATEGIA OFFLINE (OFFLINE-FIRST REVIEW)

Se descarta la pretensión de construir una arquitectura offline-first distribuida completa para la Fase 1. Se clasifica rigurosamente el comportamiento por módulo:

### 4.1. OFFLINE SAFE (Seguro y Obligatorio Offline en PWA)
- **POS Mostrador / Takeaway en Efectivo:** El cajero carga café o medialunas, cobra en efectivo, entrega el vuelto e imprime ticket interno. La transacción se almacena en IndexedDB con un UUIDv4 determinístico. Al restablecerse la red, se drena al backend sin posibilidad de conflicto.

### 4.2. OFFLINE POSSIBLE (Degradado con Condiciones)
- **KDS Cocina:** Funciona offline si y solo si la red Wi-Fi local (LAN) está activa y las comandas se transmiten por socket local directo o impresora térmica por IP (`192.168.1.X:9100`).

### 4.3. OFFLINE FORBIDDEN (Terminantemente Prohibido Offline)
- **Cobros con Tarjeta / QR MercadoPago:** Requiere conectividad con la red bancaria y webhooks de confirmación.
- **Salón / Fusión de Mesas Multi-Mozo:** Si dos mozos atienden la misma mesa sin internet desde terminales distintas, se generan órdenes divergentes imposibles de reconciliar automáticamente sin CRDTs complejos.
- **Canjes de Puntos de ARBO Club:** No se puede consultar el saldo real sin validar contra el ledger central en base de datos; permitirlo offline abriría la puerta al fraude de doble gasto de puntos.

---

## 5. LÍMITES TRANSACCIONALES ESTRICTOS (TRANSACTION BOUNDARIES)

Para asegurar la consistencia sin penalizar la velocidad de la interfaz:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   LÍMITE DE LA TRANSACCIÓN ACID (SQL)                  │
├────────────────────────────────────────────────────────────────────────┤
│ DENTRO DEL BEGIN ... COMMIT (Atómico y Bloqueante):                    │
│ 1. Actualizar orden a 'SETTLED' con timestamp oficial.                 │
│ 2. Insertar registros en tabla 'payments'.                             │
│ 3. Insertar asiento en 'cash_movements' (Caja abierta).                │
│ 4. Insertar egresos de materias primas en 'inventory_movements'.       │
│ 5. Insertar puntos acumulados en 'loyalty_transactions'.               │
│ 6. Insertar evento en 'outbox_events' (Transactional Outbox).          │
├────────────────────────────────────────────────────────────────────────┤
│ FUERA DEL COMMIT (Asíncrono y Desacoplado):                            │
│ - Broadcast WebSocket al KDS de cocina (no frena el cobro).            │
│ - Obtención de CAE fiscal ante AFIP (manejado por worker en cola).     │
│ - Recálculo de segmentación RFM en CRM.                                │
│ - Disparo de mensajes de felicitación o WhatsApp al cliente.           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. REVISIÓN DEL MOTOR DE INVENTARIO Y FICHAS TÉCNICAS

1. **Unidades Homogéneas:** Las conversiones deben validarse a nivel de base de datos (`CHECK (unit_from_family == unit_to_family)`). Gramos se convierten a Kilogramos, Mililitros a Litros.
2. **Merma Operativa (Waste Factor):** Se aplica obligatoriamente en la fórmula de descarga:
   $$\text{Egreso Stock} = \text{Cantidad Venta} \times \text{Dosis Receta} \times \left(1 + \frac{\text{Merma \%}}{100}\right)$$
3. **Auditoría de Insumos:** Las diferencias físicas de stock se ajustan mediante el tipo `ADJUSTMENT` con justificación obligatoria y usuario responsable; jamás se altera el histórico de movimientos.

---

## 7. REVISIÓN DEL CONTROL DE CAJA Y ARQUEO CIEGO

1. **Blind Count Inquebrantable:** El endpoint de cierre de caja (`POST /api/v1/cash/shifts/{id}/close`) recibe exclusivamente el array de billetes y cupones contados físicamente por el cajero. La API **NO devuelve el saldo teórico antes del cierre**, impidiendo que el empleado ajuste su declaración para ocultar faltantes.
2. **Inmutabilidad Absoluta:** La reapertura de caja no borra registros. Se inserta un evento de auditoría `SHIFT_REOPENED` con autorización de supervisor y las ventas adicionales se suman como nuevos movimientos históricos.

---

## 8. REVISIÓN DE FIDELIZACIÓN (ARBO CLUB & ANTI-FRAUDE)

1. **Prevención de Doble Acreditación:** La inserción en `loyalty_transactions` utiliza restricción de unicidad compuesta:
   ```sql
   UNIQUE(order_id, reason) WHERE reason = 'SALE_ACCRUAL';
   ```
   Si la orden se procesa dos veces por reintento de red, el segundo insert falla silenciosamente sin duplicar puntos.
2. **Saldo No Negativo:** Se impone un trigger de base de datos que aborta cualquier transacción de canje si el saldo acumulado resultante es menor a cero (`CHECK balance >= 0`).

---

## 9. REVISIÓN DEL KDS Y TIEMPO REAL

1. **Persistencia Primaria:** El KDS consulta su estado inicial directamente de las tablas `orders` y `order_items`. El WebSocket solo transmite notificaciones de cambio de estado.
2. **Reconexión Automática:** Si la conexión de socket cae, el cliente activa polling HTTP de contingencia cada 5 segundos y se reengancha automáticamente al restablecerse el canal en tiempo real.

---

## 10. REVISIÓN FISCAL: TÉCNICA vs VALIDACIÓN LEGAL

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DISTINCIÓN DE LA CAPA FISCAL                         │
├───────────────────────────────┬────────────────────────────────────────┤
│ TÉCNICAMENTE POSIBLE          │ - Encolar comprobantes y reintentar    │
│ (Diseñado en la Arquitectura) │   la obtención de CAE ante caídas AFIP │
│                               │ - Emisión de Factura A, B, C y Nota C. │
├───────────────────────────────┼────────────────────────────────────────┤
│ EXTERNAL VALIDATION REQUIRED  │ - ¿La AFIP autoriza legalmente emitir  │
│ (Pendiente de Validación Legal│   comprobante con CAE diferido en modo │
│  con Contador Matriculado)    │   línea sin controlador fiscal físico? │
│                               │ - ¿El piloto puede operar con ticket X?│
└───────────────────────────────┴────────────────────────────────────────┘
```
**Directiva de Producto:** Para el MVP piloto se implementará la arquitectura con el `MockFiscalAdapter` y la estructura formal de Facturas A/B/C, dejando la activación de certificados fiscales de producción sujeta al dictamen contable definitivo.

---

## 11. REVISIÓN DE SEGURIDAD Y VECTORES DE BYPASS

1. **Blindaje de `/admin`:** El middleware de servidor verifica la sesión JWT antes de renderizar la página. No existe bundle de administración entregado al navegador sin token válido.
2. **Protección de Storage (Fotos y Comprobantes):** Los buckets de Supabase Storage para comprobantes de pago y facturas de compras tienen RLS activo (`authenticated` y `organization_id` coincidente). Las imágenes públicas del menú residen en un bucket separado de solo lectura pública.
3. **Manejo de Secrets:** La clave maestra `SUPABASE_SERVICE_ROLE_KEY` se restringe exclusivamente al entorno del servidor (Edge Functions y Workers). El frontend solo conoce la `SUPABASE_ANON_KEY`, la cual está limitada por las políticas RLS de PostgreSQL.

---

## 12. REVISIÓN MULTI-TENANT: PROPIEDAD DE DATOS

```
┌────────────────────────────────────────────────────────────────────────┐
│                   MATRIZ DE PROPIEDAD DE DATOS                         │
├───────────────────────────────┬────────────────────────────────────────┤
│ TENANT-SCOPED (Organización)  │ - products, categories, recipes        │
│ (Compartido entre sucursales) │ - ingredients, suppliers               │
│                               │ - customers, loyalty_tiers, rewards    │
├───────────────────────────────┼────────────────────────────────────────┤
│ BRANCH-SCOPED (Sucursal)      │ - orders, order_items, payments        │
│ (Aislado físicamente por local│ - cash_shifts, cash_movements          │
│                               │ - tables, table_sessions, kds_tickets  │
│                               │ - inventory_movements, warehouses      │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 13. REVISIÓN DEL MODELO DE BASE DE DATOS

1. **Precisión Numérica:** Se erradicó cualquier uso de `FLOAT`. Se utiliza estrictamente `NUMERIC(12, 2)` para importes de dinero y `NUMERIC(12, 4)` para cantidades de insumos y costos unitarios PPP.
2. **Integridad Referencial:** Todas las claves foráneas tienen políticas explícitas (`ON DELETE CASCADE` para hijos estrictos como `order_items`; `ON DELETE RESTRICT` para entidades críticas como `ingredients` en recetas).
3. **Ausencia de Dependencias Circulares:** Las tablas se ordenan de forma jerárquica y acíclica.

---

## 14. REVISIÓN DEL MODELO DE EVENTOS

Se implementa el **Transactional Outbox Pattern** mediante la tabla `outbox_events`. Los eventos de dominio se transforman en eventos de integración mediante un relay worker que garantiza entrega *At-Least-Once*, con claves de deduplicación en los consumidores para asegurar idempotencia.

---

## 15. REVISIÓN DE LÍMITES DE API (API BOUNDARIES)

Se prohibe que los componentes de React ejecuten mutaciones directas contra las tablas SQL mediante el cliente Supabase. Todas las operaciones críticas de negocio se canalizan a través de funciones RPC o endpoints de aplicación tipados que orquestan las validaciones de dominio.

---

## 16. REVISIÓN DE LA MIGRACIÓN DE DATOS ACTUALES

| Conjunto de Datos Actual (`localStorage`) | Clasificación | Acción en la Migración |
| :--- | :--- | :--- |
| **Ventas históricas simuladas** | `DISCARD` | Se descartan por carecer de integridad y claves foráneas. |
| **Clientes y Puntos mock** | `DISCARD` | Se descartan; el CRM arrancará limpio con el primer piloto. |
| **Catálogo de Café y Hamburguesas** | `REQUIRES TRANSFORMATION` | Se extraen y transforman en el script formal `seed.sql`. |
| **Componentes Visuales (Tailwind v4)** | `MIGRATABLE` | Se preservan íntegramente migrando a `.tsx`. |

---

## 17. ORDEN DEFINITIVO DE IMPLEMENTACIÓN

Para cada fase se establece su alcance, dependencias y criterio de aceptación formal:

### Fase 1: Foundation, Tenancy & Autenticación
- *Módulos:* `organizations`, `branches`, `warehouses`, `user_profiles`, `user_memberships`.
- *Criterio de Aceptación:* Pruebas RLS pasando al 100%; login multi-tenant operativo.

### Fase 2: Catálogo, Fichas Técnicas & Stock Inicial
- *Módulos:* `categories`, `products`, `ingredients`, `recipes`, `recipe_items`, `inventory_movements`.
- *Criterio de Aceptación:* Carga de insumos, cálculo dinámico de Food Cost % y registro de compras con recálculo de PPP.

### Fase 3: Núcleo Transaccional (POS, Salón, Caja & Explosión de Recetas)
- *Módulos:* `orders`, `order_items`, `payments`, `cash_shifts`, `cash_movements`.
- *Criterio de Aceptación:* Cobro de una orden en efectivo que descuenta ingredientes por receta y cuadra la caja en arqueo ciego.

### Fase 4: KDS Realtime de Cocina
- *Módulos:* WebSockets CDC, partición por estación (Barra/Cocina), sincronización con mesas.
- *Criterio de Aceptación:* Comanda emitida en POS aparece en KDS en <300 ms y su cancelación en cocina avisa al POS.

### Fase 5: ARBO Club & Fidelización Transversal
- *Módulos:* `loyalty_transactions`, `loyalty_tiers`, selector de recompensas en checkout POS.
- *Criterio de Aceptación:* Venta que acumula puntos en ledger append-only y canje exitoso de recompensa en POS.

### Fase 6: Comercio Público & Soberanía Digital
- *Módulos:* Menú digital QR ultraliviano (<300 KB), tienda de delivery propio sin comisiones y reservas web.
- *Criterio de Aceptación:* Pedido web pagado por webhook simulado de MercadoPago se inyecta en cocina y descuenta stock.

### Fase 7: Capa Fiscal Argentina & Automatizaciones
- *Módulos:* Adaptador fiscal AFIP WSFE, cola de contingencia y automatizaciones WhatsApp.
- *Criterio de Aceptación:* Emisión de comprobante fiscal o interno transitorio sin bloquear el salón.

### Fase 8: Escala Multi-Sucursal & Depósitos
- *Módulos:* `stock_transfers`, catálogo centralizado y panel directivo consolidado.
- *Criterio de Aceptación:* Remito de transferencia que mueve insumos del Depósito Central a la sucursal de destino.

---

## 18. IMPLEMENTATION GATE (COMPUERTA TÉCNICA)

Se documentó y cerró el archivo [`IMPLEMENTATION-GATE.md`](file:///c:/Users/Thiago/arbo/docs/architecture/IMPLEMENTATION-GATE.md). El veredicto técnico es:
```
═══════════════════════════════════════════════════════════════════════
  VEREDICTO DE ARQUITECTURA: APPROVED WITH CONDITIONS
  ESTADO DEL CÓDIGO:         INTACTO (Cero código modificado en src/)
  AUTORIZACIÓN REQUERIDA:    Aprobación humana para iniciar la Fase 1
═══════════════════════════════════════════════════════════════════════
```

---

## 19. DECISIONES ABIERTAS PENDIENTES DE RESOLUCIÓN HUMANA

1. **`DEC-01` (Fiscal Piloto):** Confirmación contable sobre si el piloto operará con Comprobantes X de control interno o si tramitará certificados fiscales de prueba ante AFIP.
2. **`DEC-02` (Hardware de Salida):** Confirmar modelo y protocolo de comanderas térmicas en el primer local de prueba (Red TCP/IP vs USB).
3. **`DEC-03` (Elección del Local Piloto):** Priorización del formato comercial del primer despliegue (Cafetería mostrador vs Restaurante con mesas).

---

# ARCHITECTURE REVIEW COMPLETE

### IMPLEMENTATION STATUS
**APPROVED WITH CONDITIONS**
