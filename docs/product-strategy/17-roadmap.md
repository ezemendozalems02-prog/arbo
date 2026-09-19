# 17 — ARBO OS STRATEGIC PRODUCT ROADMAP

---

## 1. ESTRUCTURA ESTRATÉGICA POR FASES

El roadmap de ARBO OS transforma el prototipo actual en un producto de clase mundial siguiendo el principio de dependencia estricta: ninguna capa se construye sobre bases simuladas.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARBO OS ROADMAP POR FASES                       │
├───────────────────┬────────────────────┬───────────────────────────────┤
│ FASE 0: FOUNDATION│ FASE 1: TRANS. CORE│ FASE 2: OPERATIONAL DEPTH     │
│ Auth & Multi-org  │ POS, Mesas, KDS,Caja Stock x Receta, Compras PPP   │
├───────────────────┴────────────────────┴───────────────────────────────┤
│ FASE 3: CUSTOMER & GROWTH (ARBO Club, CRM, Tienda Online, Reservas)    │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 4: INTELLIGENCE & AUTOMATION (Food Cost Alertas, Triggers WhatsApp│
├────────────────────────────────────────────────────────────────────────┤
│ FASE 5: SCALE & MULTI-BRANCH (Transferencias Stock, Consolidado)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DETALLE DE FASES DE EJECUCIÓN

### FASE 0: FOUNDATION (Cimientos de Persistencia & Seguridad)
- **Objetivo:** Erradicar la dependencia de `localStorage`, proteger rutas administrativas y establecer el esquema multi-tenant.
- **Capacidades:**
  - Base de datos relacional (PostgreSQL / Supabase) con migraciones formales.
  - Autenticación segura y control de roles (Admin, Cajero, Mozo, Cocinero).
  - Entidades base modeladas con `organization_id` y `branch_id`.
  - Políticas de seguridad Row Level Security (RLS).
- **Dependencias:** Ninguna (Fase inicial).
- **Qué desbloquea:** La capacidad de guardar datos reales y multi-usuario de forma confiable.
- **Qué NO hacer todavía:** No tocar la lógica de fidelización ni diseñar campañas de marketing.

---

### FASE 1: TRANSACTIONAL CORE (El Núcleo Operativo del Local)
- **Objetivo:** Lograr que un restaurante físico pueda tomar pedidos, despachar en cocina y cobrar con caja cuadrada.
- **Capacidades:**
  - POS de mostrador con persistencia atómica de tickets (`POS.jsx`).
  - Plano de mesas interactivo con sincronización de cuentas (`FloorPlan.jsx`).
  - KDS en tiempo real con partición por estación y resolución definitiva de BUG-003 y BUG-004 (`kitchenService.js`).
  - Caja y Arqueo Ciego con inmutabilidad de turnos (resolución de BUG-018) (`cashCalculations.js`).
- **Dependencias:** Fase 0 completa.
- **Qué desbloquea:** Operación física completa del restaurante en salón y mostrador.
- **Qué NO hacer todavía:** No conectar venta online ni cálculo de descarga de stock.

---

### FASE 2: OPERATIONAL DEPTH (Costeo, Recetas & Stock Real)
- **Objetivo:** Conectar las ventas del POS con el inventario físico y la rentabilidad por plato.
- **Capacidades:**
  - Explosión automática de recetas al cobrar una orden (resolución de P0-GAP-02).
  - Registro formal de compras con cálculo de Precio Promedio Ponderado (PPP) y factores de empaque (`purchaseService.js`).
  - Módulo de ajustes de inventario por merma y rotura (`Inventory.jsx`).
  - Reporte diario de CMV (Costo de Mercadería Vendida) y Margen Bruto real.
- **Dependencias:** Fase 1 completa.
- **Qué desbloquea:** El dueño sabe con exactitud si está ganando dinero y qué materias primas reponer.
- **Qué NO hacer todavía:** No automatizar compras ni enviar mensajes externos.

---

### FASE 3: CUSTOMER & GROWTH (Soberanía Digital & Retención Directa)
- **Objetivo:** Activar los canales de venta directa del restaurante y el programa de fidelización nativo.
- **Capacidades:**
  - Tienda Online de pedidos delivery y takeaway sin comisiones (resolución de BUG-001) (`PublicDelivery.jsx`).
  - Módulo de reservas web integrado al plano de mesas (resolución de BUG-002) (`Reservas.jsx`).
  - Menú digital QR ultra-liviano (<300 KB) y accesible (`PublicMenu.jsx`).
  - ARBO Club con ledger inmutable de puntos y canje transaccional en el checkout del POS (resolución de BUG-021).
  - Directorio CRM de clientes alimentado por todos los canales de venta.
- **Dependencias:** Fases 1 y 2 completas.
- **Qué desbloquea:** Cero comisiones por ventas online para el restaurante y retención de comensales.
- **Qué NO hacer todavía:** No construir modelos de Machine Learning.

---

### FASE 4: INTELLIGENCE & AUTOMATION (Optimización Operativa)
- **Objetivo:** Automatizar la detección de desvíos, la reposición de stock y la comunicación con clientes.
- **Capacidades:**
  - Generación de Órdenes de Compra en borrador basadas en sugerencias de reposición (`purchaseSuggestionService.js`).
  - Alertas proactivas de desvío de Food Cost y degradación de márgenes (`recipeCostService.js`).
  - Triggers automatizados de mensajería (WhatsApp/Email) para cumpleaños y clientes en riesgo de abandono.
  - Matriz de Ingeniería de Menú (Estrellas, Caballos de batalla, Rompecabezas, Perros).
- **Dependencias:** Fases 2 y 3 con al menos 30 días de historial de datos acumulados.
- **Qué desbloquea:** Proactividad del sistema para ahorrar tiempo de gestión al dueño.

---

### FASE 5: SCALE & MULTI-BRANCH (Expansión y Cadenas)
- **Objetivo:** Gestionar múltiples locales, depósitos centrales y franquicias desde una sola cuenta corporativa.
- **Capacidades:**
  - Documentos formales de transferencias de stock entre depósitos (remitos de despacho y recepción).
  - Catálogo centralizado con sobreescritura de precios por sucursal.
  - Panel Directivo Consolidado (Owner Dashboard) con métricas comparativas entre locales.
  - ARBO Club compartido a nivel corporativo (puntos acumulables en cualquier sucursal).
- **Dependencias:** Arquitectura de Fase 0 validada en producción.
- **Qué desbloquea:** Venta comercial de ARBO OS a pequeños grupos gastronómicos y cadenas emergentes.
