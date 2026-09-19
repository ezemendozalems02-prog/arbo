# 02 — IDEAL CUSTOMER PROFILE (ICP)

---

## 1. METODOLOGÍA DE DEFINICIÓN DEL ICP

La definición del perfil de cliente ideal para ARBO OS se sustenta exclusivamente en la evidencia funcional analizada en las auditorías de ARBO OS y Fudo:
- **Complejidad de recetas y costeo:** ARBO cuenta con submódulos de Fichas Técnicas, cálculo de rendimiento, merma, costos indirectos e ingredientes (`[FACT: src/services/recipeCostService.js]`).
- **Canales de venta integrados:** Soporte para Mostrador/Takeaway, Salón/Mesas y Tienda Pública Web (`[FACT: src/pages/POS.jsx, src/pages/FloorPlan.jsx, src/pages/PublicMenu.jsx]`).
- **Flujo de fidelización nativo:** Ledger de puntos de lealtad, niveles/tiers y motor de segmentación booleana (`[FACT: src/services/loyaltyPointsService.js, src/services/segmentService.js]`).
- **Ausencia actual de back-office corporativo complejo:** No cuenta con módulos para franquicias globales de 50+ locales ni auditoría fiscal multi-país (`[FACT: docs/research/arbo-os/FINAL-ARBO-OS-FORENSIC-AUDIT.md]`).

Toda variable no observable en el código o en los benchmarks se cataloga rigurosamente como `[INFERENCE]`, `[HYPOTHESIS]` o `[DECISION REQUIRED]`.

---

## 2. ICP PRIMARIO: "EL GASTRONÓMICO DE ESPECIALIDAD INDEPENDIENTE"

### 2.1. Perfil del Negocio
- **Tipo de negocio:** Cafeterías de especialidad, hamburgueserías gourmet, cervecerías artesanales, pizzerías napolitanas, restaurantes casual-dining independientes y dark kitchens mono-marca (`[INFERENCE: formatos que combinan mostrador ágil, salón dinámico y delivery directo]`).
- **Cantidad de sucursales:** 1 a 3 locales operativos (`[INFERENCE: escala ideal para la gestión directa del dueño/encargado sin requerir un ERP corporativo]`).
- **Volumen de operaciones:** 80 a 350 comandas diarias por sucursal (`[INFERENCE: rango donde el descontrol manual de insumos y el caos de comandas se vuelve crítico]`).
- **Dotación de personal:** 4 a 15 empleados en total (cajeros, mozos, baristas/cocineros, encargado).

### 2.2. Necesidades Operativas Específicas
- **Caja:** Apertura, control de turnos, múltiples medios de pago (efectivo, MercadoPago/QR, tarjetas) y arqueo ciego contra diferencias de caja (`[FACT: src/services/cashCalculations.js]`).
- **Cocina/Despacho:** Pantalla KDS o comanda de preparación clara organizada por estaciones (ej. Barra vs Cocina) con tiempos de despacho visibles (`[FACT: src/services/kitchenService.js]`).
- **Control de Stock y Costos:** Elaboración a partir de recetas e insumos base. Necesidad imperiosa de saber el Food Cost real frente a la inflación de materias primas (`[FACT: src/services/recipeCostService.js]`).
- **Canal Directo & Clientes:** Deseo de liberarse del 15% al 25% de comisión de agregadores de delivery (Rappi/PedidosYa) mediante su propio canal de pedidos online y fidelizar comensales habituales con beneficios tangibles (`[FACT: src/services/loyaltyPointsService.js]`).

### 2.3. Por qué ARBO OS encaja perfectamente
Porque el ICP Primario valora el diseño estético de su marca, necesita velocidad en caja, cuida su margen plato por plato y no quiere pagar múltiples suscripciones ni cargos adicionales abusivos por tener una tienda online o reservas.

---

## 3. ICP SECUNDARIO: "PEQUEÑO GRUPO GASTRONÓMICO EN EXPANSIÓN"

### 3.1. Perfil del Negocio
- **Tipo de negocio:** Cadenas emergentes de 2 a 5 sucursales (ej. franquicias iniciales o locales propios de la misma marca) con centro de producción o depósito compartido.
- **Volumen de operaciones:** 300 a 1.000 pedidos diarios consolidados.
- **Dotación de personal:** 15 a 40 empleados distribuidos en sucursales.

### 3.2. Necesidades Operativas Específicas
- **Consolidación de catálogo:** Menú y precios centralizados o diferenciados por sucursal.
- **Transferencias de stock:** Movimiento de insumos entre depósito central y puntos de venta (`[FACT: Fudo carece de transferencias formales; es una ventaja competitiva para ARBO]`).
- **Visión global del dueño:** Panel unificado de ventas, Food Cost consolidado y comparativa de rendimiento entre locales.

### 3.3. Por qué ARBO OS encaja condicionalmente
Requiere que la arquitectura Multi-Branch con aislamiento de datos (`organization_id`, `branch_id`) esté formalmente implementada en base de datos (`[RECOMMENDATION: Paso 10 & 12]`).

---

## 4. NO-ICP INICIAL (EXCLUSIONES EXPLÍCITAS)

| Segmento | Justificación Técnica y Operativa |
| :--- | :--- |
| **Grandes Franquicias Corporativas (50+ locales, ej. McDonald's, Starbucks)** | Requieren integraciones complejas de ERP (SAP/Oracle), esquemas de auditoría SOX, facturación fiscal en múltiples jurisdicciones globales y matrices de roles corporativos ultra-complejas (`[FACT]`). |
| **Bares de Noche / Boliches Masivos** | Operan con control de entradas, barras caóticas a alta velocidad sin comanda de cocina, fichas/tokens y modelos de consumo nocturno no gastronómico (`[INFERENCE]`). |
| **Comedores Institucionales / Hoteles All-Inclusive** | Dependen de facturación agrupada a cuentas de habitación (PMS), compras por licitación y contratos corporativos (`[INFERENCE]`). |
| **Puestos Callejeros Informales Ultra-Básicos** | No costean recetas, no manejan inventario, operan 100% en efectivo informal y un cuaderno les resulta suficiente (`[INFERENCE]`). |

---

## 5. INCÓGNITAS Y DECISIONES PENDIENTES [UNKNOWN / DECISION REQUIRED]

- **[DECISION REQUIRED - DISPONIBILIDAD FISCAL]:** ¿El ICP Primario inicial operará 100% con facturación electrónica obligatoria (AFIP/ARCA) desde el Día 1, o se captarán inicialmente negocios en fase de prueba piloto con comprobantes internos no fiscales?
- **[DECISION REQUIRED - HARDWARE DE IMPRESIÓN]:** ¿Qué porcentaje del ICP exige impresoras térmicas ESC/POS físicas conectadas por USB/Red vs operación puramente digital con KDS y comandas en pantalla?
- **[UNKNOWN - PRICING & DISPOSICIÓN A PAGAR]:** No se dispone en auditoría de encuestas de elasticidad de precio del mercado argentino/latam para ARBO OS. La tarifa mensual óptima (SaaS plano vs escalonado) es una decisión de negocio pendiente.
