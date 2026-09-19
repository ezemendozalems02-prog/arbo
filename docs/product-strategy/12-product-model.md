# 12 — ARBO OS PRODUCT MODEL (ARQUITECTURA EN CAPAS)

---

## 1. VISIÓN DEL MODELO DE PRODUCTO

ARBO OS se estructura conceptualmente como una arquitectura en 5 capas concéntricas e interdependientes. Cada capa construye valor sobre la anterior, garantizando que la sofisticación analítica y de crecimiento descanse siempre sobre una base transaccional inquebrantable.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        5. CUSTOMER LAYER                               │
│        (Menú QR, Tienda Delivery, Reservas, Portal ARBO Club)          │
├────────────────────────────────────────────────────────────────────────┤
│                        4. GROWTH LAYER                                 │
│        (Segmentación RFM, Campañas WhatsApp/Email, Fidelización)       │
├────────────────────────────────────────────────────────────────────────┤
│                        3. INTELLIGENCE LAYER                           │
│        (Food Cost Dinámico, Alertas de Margen, Sugerencia Compras)     │
├────────────────────────────────────────────────────────────────────────┤
│                        2. OPERATIONAL LAYER                            │
│        (POS Mostrador, Plano de Mesas, KDS Cocina, Control de Caja)    │
├────────────────────────────────────────────────────────────────────────┤
│                        1. CORE PLATFORM                                │
│   (Auth, Multi-Tenant, Transacciones ACID, Ledger Inmutable, APIs)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DESGLOSE CONCEPTUAL POR CAPA

### 2.1. Capa 1: Core Platform (El Núcleo Transaccional)
- **Qué es:** Los cimientos técnicos, de persistencia y seguridad sobre los que corre todo el sistema.
- **Componentes clave:**
  - Base de datos relacional con transacciones ACID (PostgreSQL / Supabase).
  - Multi-tenancy nativo (`organization_id`, `branch_id`).
  - Motor de seguridad con autenticación robusta y Row Level Security (RLS).
  - Ledgers inmutables (movimientos de caja, transacciones de stock, puntos de fidelización).
  - Event Bus para sincronización en tiempo real (WebSockets).
- **Rol en el negocio:** Garantiza que nunca se pierda un centavo de caja ni un gramo de stock.

### 2.2. Capa 2: Operational Layer (La Capa de Ejecución)
- **Qué es:** Las herramientas de uso continuo para el personal durante el servicio diario.
- **Componentes clave:**
  - POS de mostrador con carga ultra-rápida y teclado ergonómico (`POS.jsx`).
  - Plano visual de mesas con estados dinámicos (`FloorPlan.jsx`).
  - Pantalla KDS con partición de comandas por estación (`kitchenService.js`).
  - Control de Caja con arqueo ciego y turnos cerrados (`cashCalculations.js`).
  - Impresión térmica ESC/POS para tickets y comandas de cocina.
- **Rol en el negocio:** Maximiza la velocidad del despacho y elimina los errores de servicio.

### 2.3. Capa 3: Intelligence Layer (La Capa de Comprensión)
- **Qué es:** El motor analítico y determinístico que convierte los datos transaccionales en decisiones de negocio.
- **Componentes clave:**
  - Motor de costeo por receta con cálculo de merma y margen bruto (`recipeCostService.js`).
  - Sugerencias automáticas de abastecimiento y reorden (`purchaseSuggestionService.js`).
  - Alertas en tiempo real por degradación de margen y quiebre de stock.
  - Informes de rentabilidad y CMV (Costo de Mercadería Vendida) diario.
- **Rol en el negocio:** Protege el margen financiero del dueño frente a la inflación y el desperdicio.

### 2.4. Capa 4: Growth Layer (La Capa de Expansión y Retención)
- **Qué es:** El sistema que impulsa la recurrencia del cliente y el aumento del valor de vida (LTV).
- **Componentes clave:**
  - Motor de ARBO Club (niveles, beneficios, multiplicadores de puntos) (`loyaltyPointsService.js`).
  - Segmentador dinámico de comensales por comportamiento (`segmentService.js`).
  - Triggers automatizados de re-engagement (cumpleaños, riesgo de abandono).
  - Integración de mensajería directa (WhatsApp / Email transaccional).
- **Rol en el negocio:** Genera ventas incrementales recurrentes a coste cero de adquisición.

### 2.5. Capa 5: Customer Layer (La Interfaz del Comensal)
- **Qué es:** La cara visible de la marca gastronómica en internet y en el móvil del cliente.
- **Componentes clave:**
  - Menú QR ligero, responsive y accesible (`PublicMenu.jsx`).
  - Tienda online propia de delivery y takeaway sin comisiones (`PublicDelivery.jsx`).
  - Motor de reservas web integrado al salón (`Reservas.jsx`).
  - Portal de autoservicio para consulta de puntos y recompensas del Club.
- **Rol en el negocio:** Garantiza la soberanía digital del local, ahorrando comisiones de terceros.

---

## 3. PRINCIPIO DE INTEGRIDAD ENTRE CAPAS

Ninguna capa superior puede funcionar de espaldas a las capas inferiores:
- La **Capa de Clientes (5)** inyecta pedidos directamente en la **Capa Operativa (2)** y acumula datos en la **Capa de Crecimiento (4)**.
- La **Capa de Crecimiento (4)** alimenta la **Capa de Inteligencia (3)** con patrones de consumo.
- La **Capa de Inteligencia (3)** audita la rentabilidad de la **Capa Operativa (2)**.
- Todas las capas descansan sobre la inmutabilidad de la **Capa Core (1)**.
