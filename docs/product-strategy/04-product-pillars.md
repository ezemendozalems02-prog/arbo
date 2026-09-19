# 04 — ARBO OS PRODUCT PILLARS

---

## INTRODUCCIÓN METODOLÓGICA

Un pilar de producto no es una lista de pantallas ni una categoría cosmética del menú de navegación. Es una **capacidad estratégica no negociable** que define el valor que ARBO OS entrega al restaurante.

Se establecen **5 Pilares Estratégicos**, derivados directamente de los hallazgos de las auditorías forenses:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARBO OS PRODUCT PILLARS                         │
├───────────────────┬────────────────────┬───────────────────────────────┤
│ 1. OPERATIONAL    │ 2. PRECISION       │ 3. FINANCIAL INTEGRITY        │
│    VELOCITY       │    COSTING & STOCK │    & CASH CONTROL             │
├───────────────────┴────────────────────┴───────────────────────────────┤
│ 4. NATIVE CUSTOMER RETENTION & DIRECT SALES                            │
├────────────────────────────────────────────────────────────────────────┤
│ 5. ACTIONABLE OPERATIONAL INTELLIGENCE                                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## PILAR 1: OPERATIONAL VELOCITY (PISO, MOSTRADOR & KDS)

### Propósito
Permitir que el personal del restaurante tome pedidos, adicione mesas y despache platos en cocina a la máxima velocidad posible, con latencia imperceptible y cero fricción ergonómica.

### Problema que resuelve
- Cuellos de botella en horas pico donde el cajero o mozo lidian con interfaces lentas y formularios con clics innecesarios.
- Pérdida de comandas en papel, pedidos duplicados y descoordinación entre salón y cocina.

### Capacidades necesarias
- POS ultra-rápido para mostrador/takeaway con teclado numérico y atajos de teclado (`[FACT: src/pages/POS.jsx]`).
- Mapa de mesas visual e interactivo (`FloorPlan.jsx`) con estados en tiempo real (Libre, Ocupada, Pidiendo, Cuenta solicitada).
- KDS (Kitchen Display System) digital con partición automática de tickets por estación de preparación (`[FACT: src/services/kitchenService.js]`).
- Sincronización atómica y bidireccional entre comanda, KDS y caja.

### Estado actual de ARBO
- **Componentes UI y lógica de partición:** Excelente diseño y algoritmos de agrupación en memoria listos (`[FACT: kitchenService.js]`).
- **Gaps críticos:** Sin persistencia en base de datos. Desconexión entre KDS y POS (BUG-003, BUG-004) (`[FACT]`).

### Dependencias
- Motor de base de datos con suscripciones en tiempo real (WebSockets / Supabase Realtime).

### Potencial diferencial
- Experiencia de usuario significativamente superior a Fudo (Fudo utiliza un KDS rudimentario y vistas de salón con interfaces legacy) (`[FACT: docs/research/fudo-vs-arbo/02-pos-floor-kitchen.md]`).

### Evidencia
- `src/services/kitchenService.js`, `src/pages/POS.jsx`, `src/pages/FloorPlan.jsx`, `docs/research/arbo-os/FINAL-ARBO-OS-FORENSIC-AUDIT.md`.

---

## PILAR 2: PRECISION COSTING & INVENTORY ENGINE

### Propósito
Garantizar el control exacto de las materias primas mediante la explosión automática de recetas al vender, el seguimiento del costo promedio ponderado y la detección temprana de mermas y desvíos.

### Problema que resuelve
- La ceguera del hostelero sobre el costo real de elaboración frente a la inflación de insumos.
- El "robo hormiga" y los faltantes inexplicables descubiertos a fin de mes.

### Capacidades necesarias
- Fichas técnicas multi-nivel (platos compuestos por ingredientes simples y sub-recetas elaboradas) (`[FACT: src/services/recipeCostService.js]`).
- Cálculo dinámico de Food Cost %, Margen Bruto y factores de merma (`[FACT]`).
- Descuento automático de stock de ingredientes por cada ítem vendido.
- Registro de compras con costo unitario promedio ponderado (PPP) y conversión de factores de empaque (ej. bulto a kg) (`[FACT: src/services/purchaseService.js]`).
- Auditorías y ajustes de stock con motivos explícitos (`[FACT: src/pages/Inventory.jsx]`).

### Estado actual de ARBO
- **Servicios de costeo y compras:** Matemáticamente impecables y completos en código (`[FACT: recipeCostService.js, purchaseService.js]`).
- **Gaps críticos:** El POS no descuenta el stock en la venta actual (`InventoryContext.jsx:18-22`) (`[FACT]`).

### Dependencias
- Transacciones ACID en base de datos al confirmar ventas. Catálogo unificado de ingredientes.

### Potencial diferencial
- Fudo cobra add-ons o no ofrece costeo dinámico en tiempo real integrado al margen de venta; ARBO ya tiene la lógica de yield/merma programada (`[FACT: 03-inventory-costing.md]`).

### Evidencia
- `src/services/recipeCostService.js`, `src/services/purchaseService.js`, `src/pages/Recetas.jsx`, `src/pages/Inventory.jsx`.

---

## PILAR 3: FINANCIAL INTEGRITY & CASH CONTROL

### Propósito
Blindar la recaudación del restaurante, asegurando que cada peso ingresado por cualquier canal o medio de pago quede registrado, conciliado y trazable hasta el cierre de turno.

### Problema que resuelve
- Descuadres de caja, faltantes de efectivo no detectados y falta de control sobre turnos de empleados.
- Confusión en cobros divididos y conciliación de cobros digitales.

### Capacidades necesarias
- Apertura y cierre de turnos de caja con control de saldo inicial (`[FACT: src/services/cashCalculations.js]`).
- Arqueo ciego (el cajero cuenta sin ver el saldo teórico para evitar manipulación).
- Múltiples medios de pago concurrentes en una misma orden (efectivo, MercadoPago, tarjeta, puntos).
- Registro estricto e inmutable de ingresos y egresos extraordinarios de caja (`[FACT]`).
- Emisión de comprobantes internos y facturación fiscal electrónica integrada (AFIP/ARCA) (`[RECOMMENDATION]`).

### Estado actual de ARBO
- **Cálculos y conciliación:** Módulo de Caja con reportes visuales de balance operativo implementado (`[FACT: Caja.jsx]`).
- **Gaps críticos:** BUG-018 borra movimientos al reabrir caja. Falta integración fiscal oficial (`[FACT]`).

### Dependencias
- Registro de transacciones inmutable (ledger append-only). Motor de facturación fiscal.

### Potencial diferencial
- Integración visual de caja con arqueo detallado por medio de pago sin requerir módulos externos.

### Evidencia
- `src/services/cashCalculations.js`, `src/pages/Caja.jsx`, `docs/research/arbo-os/21-cash-flow-summary.md`.

---

## PILAR 4: NATIVE CUSTOMER RETENTION & DIRECT SALES (ARBO CLUB & TIENDA)

### Propósito
Convertir al comensal anónimo en un cliente recurrente mediante canales propios de venta (Takeaway, Delivery, Reservas) sin intermediarios ni comisiones, potenciado por un programa de lealtad integrado.

### Problema que resuelve
- La dependencia ruinosa de agregadores externos (comisiones del 15% al 25%).
- La comisión extractiva que cobra Fudo (1.9% + IVA) sobre la propia tienda online del restaurante (`[FACT: docs/research/fudo/14-fudo-online.md]`).
- La incapacidad de retener al cliente que visita el salón.

### Capacidades necesarias
- Tienda pública web ultra-rápida, responsive y estéticamente atractiva (`[FACT: src/pages/PublicDelivery.jsx]`).
- Menú digital QR con carga instantánea y diseño de marca (`[FACT: src/pages/PublicMenu.jsx]`).
- Módulo de reservas online integrado a la ocupación de mesas (`[FACT: src/pages/Reservas.jsx]`).
- Programa ARBO Club nativo: ledger inmutable de puntos, niveles (tiers), recompensas y auto-registro (`[FACT: src/services/loyaltyPointsService.js]`).
- CRM unificado: historial de consumo, frecuencia de visita y ticket promedio por comensal (`[FACT: src/pages/Clientes.jsx]`).

### Estado actual de ARBO
- **Diseño y arquitectura visual:** Extraordinario frontend con micro-animaciones y paleta cuidada.
- **Gaps críticos:** El checkout público (/pedidos) y reservas descartan datos en memoria (BUG-001, BUG-002). El POS no consume clientes ni puntos (BUG-006, BUG-021) (`[FACT]`).

### Dependencias
- Gateway de pagos digitales (MercadoPago Checkout Pro / Webhook). Persistencia de órdenes y clientes en BD.

### Potencial diferencial
- **DIFERENCIADOR RADICAL:** Cero comisiones por venta online. Fudo cobra 1.9% + IVA por pedido y $55.000/mes por reservas; ARBO lo incluye de forma nativa sin peajes (`[FACT: FINAL-FUDO-VS-ARBO-COMPARATIVE-AUDIT.md]`).

### Evidencia
- `src/pages/PublicDelivery.jsx`, `src/pages/PublicMenu.jsx`, `src/services/loyaltyPointsService.js`, `src/pages/Clientes.jsx`.

---

## PILAR 5: ACTIONABLE OPERATIONAL INTELLIGENCE

### Propósito
Procesar los datos del restaurante para brindar alertas y recomendaciones automáticas de abastecimiento, control de costos y fidelización sin exigir al dueño ser analista de datos.

### Problema que resuelve
- Quiebres de stock imprevistos durante el servicio.
- Platos que pierden rentabilidad debido al aumento silencioso de materias primas.
- Clientes habituales que abandonan el local sin que nadie lo note.

### Capacidades necesarias
- Sugerencias automáticas de compras basadas en stock mínimo, órdenes pendientes y factores de empaque (`[FACT: src/services/purchaseSuggestionService.js]`).
- Alertas de Food Cost crítico y degradación de márgenes de ganancia por plato (`[FACT: src/services/recipeCostService.js]`).
- Segmentación dinámica de clientes por comportamiento (Frecuencia, Recencia, Valor - RFM) (`[FACT: src/services/segmentService.js]`).
- Triggers de acción automática (ej. aviso de reposición, cumpleaños de comensal).

### Estado actual de ARBO
- **Algoritmos y lógica de negocio:** Completamente implementados en servicios puros (`[FACT: purchaseSuggestionService.js, segmentService.js]`).
- **Gaps críticos:** No hay un cron/worker que ejecute evaluaciones periódicas ni salidas externas de notificación (Email/WhatsApp) (`[FACT]`).

### Dependencias
- Historial transaccional acumulado y motor de eventos en backend.

### Potencial diferencial
- Frente al enfoque de Fudo de vender un "bot de WhatsApp IA" por $55.000/mes, ARBO ofrece inteligencia operacional integrada al margen y a la compra sin sobrecostos.

### Evidencia
- `src/services/purchaseSuggestionService.js`, `src/services/segmentService.js`, `src/pages/Inteligencia.jsx`.
