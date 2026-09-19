# 05 — Clientes, CRM, Fidelización, Marketing e Inteligencia Artificial

**Categorías cubiertas:**
20. Directorio de Clientes y CRM
21. Programa de Fidelización (Loyalty)
22. Campañas de Marketing
23. Automatizaciones de Fidelización
33. Inteligencia Artificial (IA)
34. Analítica y Métricas de Clientes (RFM, CLV, Retención)

---

## 20. Directorio de Clientes y CRM

### FUDO
- **Qué hace:** Libreta de contactos orientada a la gestión de delivery y cuentas corrientes.
- **Qué fue documentado (`DOCUMENTED` en Fase 11 y art. 11730908):**
  - Campos de cliente: Nombre, Teléfono, Dirección (con referencias para el repartidor), Email, CUIT, Saldo de cuenta corriente y notas operativas.
  - La captura de datos ocurre principalmente por teléfono o al realizar pedidos en la Tienda Online propia.
  - **Limitación estructural comprobada:** Los pedidos provenientes de agregadores (Rappi, PedidosYa) llegan anonimizados; Fudo no captura ni enriquece el perfil del comensal.
  - **Inexistencia de Segmentación Dinámica:** No permite crear audiencias basadas en comportamiento de consumo (ej. *"clientes que no vienen hace 30 días y gastan más de $15.000"*).
- **Estado:** `CONFIRMED_WORKING` (Como directorio de delivery/facturación; primitivo como herramienta de fidelización).

### ARBO OS
- **Qué hace:** Módulo de CRM analítico avanzado en `/admin/clientes` sobre 126 clientes semilla y persistencia en `arbo_crm_v1`.
- **Qué fue observado (`OBSERVED` en `13-crm-customers.md`):**
  - **Ficha de cliente enriquecida:** Métricas de visitas, gasto acumulado, ticket promedio, saldo de puntos, nivel de club, historial de actividad, notas internas fechadas y tags (`VIP`, `Vegano`).
  - **Motor de Segmentación Lógica (`segmentService.js` · `CONFIRMED_WORKING`):** Evalúa árboles de condiciones `AND`/`OR` con operadores comparativos (`>`, `<`, `==`) sobre el perfil calculado del cliente.
  - **Gestión de Consentimientos (`updateConsent`):** Registro de opt-in para Email, WhatsApp y Marketing con timestamp.
  - **Defectos Críticos:**
    - **BUG-006 (P1):** Los clientes creados en el CRM son invisibles en el POS (`CustomerPickerModal.jsx` lee mock estático).
    - **BUG-020 (P2):** El servicio de deduplicación de contactos (`customerMatchingService.js`) existe en código pero nunca es invocado por el modal de alta, permitiendo clientes duplicados.
- **Estado:** `PARTIAL` (Modelo conceptual y segmentación muy avanzados; desconectado del mostrador).

### DIFERENCIA COMPROBADA
FUDO posee un CRM transaccional básico conectado a la facturación y el delivery, pero sin segmentación. ARBO OS cuenta con un motor de segmentación dinámico y gestión de consentimientos de alta sofisticación, pero desconectado del punto de cobro.

---

## 21. Fidelización (Loyalty / Club de Puntos)

### FUDO
- **Qué hace:** FUDO **no posee un módulo de fidelización nativo**.
- **Qué fue documentado (`DOCUMENTED` en Fase 11 y 23):**
  - No existe acumulación de puntos por compras.
  - No existen niveles de clientes (tiers).
  - No hay emisión ni validación de cupones o canjes de beneficios.
  - Cualquier estrategia de puntos requiere contratar e integrar plataformas SaaS externas vía API (solo en Plan Pro).
- **Estado:** `NOT_IMPLEMENTED`.

### ARBO OS
- **Qué hace:** Sistema completo de fidelización "ARBO Club" (`/admin/loyalty/*`).
- **Qué fue observado (`OBSERVED` en `14-loyalty-arbo-club.md`):**
  - **Libro Mayor de Puntos (`CONFIRMED_WORKING`):** `loyaltyPointsService.js` emite transacciones inmutables (`EARN`, `REDEEM`, `ADJUST`, `REFUND`) garantizando trazabilidad con `balanceBefore` y `balanceAfter`.
  - **4 Niveles de Membresía:** *Semilla* (0-499 pts), *Brote* (500-1499 pts), *Árbol* (1500-3499 pts) y *Copa* (3500+ pts).
  - **Catálogo de Premios y Canjes:** Generación determinística de cupones `ARBO-XXXXX` con validación de saldo.
  - **Defectos Críticos:**
    - **BUG-021 (P1):** Los códigos de canje no pueden consumirse ni aplicarse en el POS.
    - **BUG-010 (P2):** Cancelar un canje que ya fue entregado (`status === 'utilizado'`) devuelve los puntos al cliente.
    - **BUG-022 (P2):** La página web pública `/arbo-club` es una maqueta estática con un socio demo fijo.
- **Estado:** `PARTIAL` (Arquitectura contable de puntos excelente; falta conectividad con la caja).

### DIFERENCIA COMPROBADA
FUDO carece de fidelización nativa. ARBO OS tiene implementado un sistema completo de puntos, niveles y canjes que solo requiere ser conectado a la interfaz de cobro.

---

## 22 & 23. Campañas y Automatizaciones de Marketing

### FUDO
- **Qué hace:** FUDO **no dispone de módulo de campañas ni automatizaciones de marketing**.
- **Qué fue documentado (`DOCUMENTED` en Fase 11 y 16):**
  - No envía mensajes automáticos de cumpleaños ni de recuperación de clientes inactivos.
  - No permite redactar ni despachar campañas de email o WhatsApp desde el sistema.
  - Para comunicación saliente depende exclusivamente de su bot de WhatsApp ("Recepcionista IA") enfocado en reservas.
- **Estado:** `NOT_IMPLEMENTED`.

### ARBO OS
- **Qué hace:** Creador de campañas (`/admin/marketing/campanas`) y panel de automatizaciones (`/admin/automatizaciones`).
- **Qué fue observado (`OBSERVED` en `15-marketing-automations.md`):**
  - Permite definir campañas vinculadas a segmentos con previsualización de audiencia y variables dinámicas (`{{nombre}}`, `{{puntos}}`).
  - 9 disparadores de automatización declarados (`CUSTOMER_CREATED`, `BIRTHDAY`, `CUSTOMER_INACTIVE`, etc.).
  - **FACT · SIMULATED:** No existen canales de salida reales (WhatsApp / Email). El botón "Enviar" ejecuta `simulateSend` generando aperturas y clics falsos con `Math.random()`.
  - **BUG-023 (P2):** Las automatizaciones leen de mocks estáticos y no de las ventas vivas de la sesión.
- **Estado:** `UI_ONLY` / `SIMULATED`.

---

## 33. Inteligencia Artificial (IA)

### FUDO
- **Qué hace:** "Recepcionista Virtual con Inteligencia Artificial" (Add-on comercial de $55.000/mes).
- **Qué fue documentado (`DOCUMENTED` en Fase 16 y art. 16379811):**
  - Agente conversacional conectado a la API de WhatsApp Business.
  - Responde consultas frecuentes sobre la carta, horarios y ubicación.
  - Toma reservas de clientes y las agenda automáticamente en el módulo de reservas de Fudo.
  - **Limitación comprobada:** Es un add-on de costo elevado ($55.000 mensuales adicionales sobre el abono de Fudo) y bloquea el acceso a reservas si no se contrata.
- **Estado:** `CONFIRMED_WORKING` (Servicio comercial activo en producción).

### ARBO OS
- **Qué hace:** Cero integración con modelos de lenguaje o agentes de IA en runtime.
- **Qué fue observado (`OBSERVED`):** No existen llamadas a APIs de OpenAI, Anthropic ni Gemini dentro del código de la aplicación.
- **Estado:** `NOT_IMPLEMENTED`.

---

## 34. Analítica de Clientes (RFM, CLV y Cohortes)

### FUDO
- **Qué hace:** Reportes estadísticos tradicionales de ventas por cliente y clientes con mayor gasto acumulado.
- **Qué fue documentado (`DOCUMENTED` en Fase 12):** Listados exportables a Excel de clientes con volumen total facturado y visitas. No implementa algoritmos de segmentación analítica moderna (RFM / CLV).
- **Estado:** `CONFIRMED_WORKING` (Reportes clásicos).

### ARBO OS
- **Qué hace:** Módulo de analítica avanzada en `/admin/analisis/*`.
- **Qué fue observado (`OBSERVED` en `16-costing-analytics.md`):**
  - **RFM (`RFM.jsx` · `CONFIRMED_WORKING`):** Cálculo desacoplado de Recencia (días desde última visita), Frecuencia (visitas) y Valor Monetario ($) sin etiquetas subjetivas forzadas.
  - **CLV Estimado (`calcCLV` · `CONFIRMED_WORKING`):** Cálculo de Customer Lifetime Value basado en ticket promedio y frecuencia anualizada.
  - **Retención (`Retention.jsx` · `CONFIRMED_WORKING`):** Medición de clientes nuevos, activos, recurrentes e inactivos.
  - **Cohortes (`Cohorts.jsx` · `UI_ONLY`):** Generador determinístico de cohortes de retención mensual (Abr-Sep 2026) rotulado explícitamente como demo.
- **Estado:** `CONFIRMED_WORKING` (Cálculos analíticos puros de alto valor estratégico).

---

## Síntesis Clasificatoria

| Área | Clasificación FUDO | Clasificación ARBO OS | Tipo de Brecha |
|---|---|---|---|
| **Directorio de Clientes** | `CONFIRMED_WORKING` | `CONFIRMED_WORKING` | **PARIDAD** |
| **Segmentación Dinámica** | `NOT_IMPLEMENTED` | `CONFIRMED_WORKING` (En memoria) | **OPORTUNIDAD ARBO** |
| **Fidelización / Puntos** | `NOT_IMPLEMENTED` | `PARTIAL` (BUG-021 sin POS) | **OPORTUNIDAD ARBO** |
| **Campañas de Marketing** | `NOT_IMPLEMENTED` | `UI_ONLY` (Simuladas) | **OPORTUNIDAD ARBO** |
| **Automatizaciones** | `NOT_IMPLEMENTED` | `UI_ONLY` (Simuladas) | **OPORTUNIDAD ARBO** |
| **Recepcionista IA WhatsApp**| `CONFIRMED_WORKING` ($55k/mes) | `NOT_IMPLEMENTED` | **GAP COMERCIAL** |
| **Analítica RFM / CLV** | `NOT_IMPLEMENTED` | `CONFIRMED_WORKING` | **OPORTUNIDAD ARBO** |
