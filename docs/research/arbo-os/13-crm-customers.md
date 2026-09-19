# 13 — Clientes y CRM

**Rutas:** `/admin/clientes`, `/admin/clientes/:id`, `/admin/clientes/segmentos`, `/admin/clientes/actividad`  
**Archivos:** `src/admin/pages/crm/Customers.jsx`, `CustomerDetail.jsx`, `Segments.jsx`, `Activity.jsx`, `src/services/customerMatchingService.js`, `customerAnalyticsService.js`, `segmentService.js`, `src/context/CRMContext.jsx`  
**Estado general:** `PARTIAL` — catálogo de clientes, notas, tags, consentimientos y motor de reglas de segmentación bien estructurados como subsistema aislado; completamente desvinculado del POS (BUG-006) y de los pedidos/reservas del sitio público.

---

## 13.1 Modelo de Datos y Volumen

- **Semilla (`src/mock/customers.js`):** 126 clientes generados con PRNG determinístico (`createRng(2026)`), con métricas precalculadas: `visits`, `orders`, `reservations`, `totalSpent`, `avgTicket`, `points`, `tier`, `lastActivity`.
- **Persistencia mutable:** `arbo_crm_v1` en `localStorage` (176 KB medidos en sesión). Contiene el array enriquecido con `notes`, `tags` y `consent: { email, whatsapp, marketing, updatedAt }`.
- **Auditoría interna:** Cada alta, cambio de notas o canje inserta una entrada en `auditLog` dentro del contexto (`CRMContext.jsx:79`).

---

## 13.2 Operaciones Verificadas

| Operación | Componente / Servicio | Estado | Detalle |
|---|---|---|---|
| Búsqueda y filtrado de clientes | `Customers.jsx` | `CONFIRMED_WORKING` | Búsqueda por nombre, email o teléfono; filtros por nivel (tier). |
| Detalle de cliente | `CustomerDetail.jsx` | `CONFIRMED_WORKING` | Perfil, métricas de consumo, historial de actividad, puntos y canjes. |
| Agregar nota interna | `addCustomerNote` | `CONFIRMED_WORKING` | Agrega nota con timestamp y autor (`Valentina (mozo)`). |
| Asignar / quitar tags | `setCustomerTags` | `CONFIRMED_WORKING` | Permite gestionar etiquetas personalizadas (ej. `VIP`, `Vegano`). |
| Gestión de consentimientos | `updateConsent` | `CONFIRMED_WORKING` | Flags booleanos para Email, WhatsApp y Marketing con fecha de actualización. |
| Crear nuevo cliente | `NewCustomerModal.jsx` | `CONFIRMED_WORKING` | Crea cliente y lo persiste en `arbo_crm_v1`. |
| Motor de segmentación | `segmentService.js` | `CONFIRMED_WORKING` | Evalúa reglas lógicas `AND`/`OR` sobre perfiles calculados (`visits`, `totalSpent`, etc.). |
| Métricas analíticas (RFM, CLV) | `customerAnalyticsService.js` | `CONFIRMED_WORKING` | Cálculos puros sin efectos secundarios. CLV marcado como estimado. |
| Deduplicación por contacto | `customerMatchingService.js` | `CODE_ONLY` | Servicio implementado pero **nunca llamado por ningún componente** (BUG-020). |
| Sincronización POS ↔ CRM | — | `BROKEN` | Ver BUG-006. Clientes del CRM invisibles en mostrador. |
| Vínculo con Pedidos públicos | — | `NOT_IMPLEMENTED` | Un pedido web en `/pedidos` no busca ni crea cliente en el CRM. |
| Vínculo con Reservas públicas | — | `NOT_IMPLEMENTED` | Una reserva en `/reservas` no impacta el CRM. |

---

## 13.3 Análisis del Motor de Segmentación (`segmentService.js`)

El servicio de segmentación (`src/services/segmentService.js:6-27`) evalúa reglas sobre el perfil analítico del cliente (`buildCustomerProfile`):

```js
function evaluateRule(rule, profile) {
  const value = profile[rule.field]
  switch (rule.operator) {
    case '>': return value > rule.value
    case '>=': return value >= rule.value
    case '<': return value < rule.value
    case '<=': return value <= rule.value
    case '==': return value === rule.value
    default: return false
  }
}
```

- **Semilla de segmentos (`src/mock/segments.js`):** 6 segmentos preconfigurados: *Habituales*, *En riesgo de abandono*, *Amantes del vino*, *VIP*, *Nuevos del mes*, *Sin visitas hace 90 días*.
- **Evaluación dinámica:** `getSegmentMembers` filtra los 126 clientes en memoria en runtime. Rápido y sin fallos detectados.

---

## 13.4 Defectos y Riesgos Identificados

### BUG-006 · P1 · Cliente creado en CRM no existe en el POS
Ya documentado en `25-bugs.md`. `CustomerPickerModal.jsx` importa directamente `mock/customers.js` estático en vez de consumir el estado del CRM. Los puntos asignados en la venta tampoco se acreditan a la ficha del cliente en el CRM.

### BUG-016 · P3 · Formulario de alta sin validación de email ni teléfono
Documentado en `25-bugs.md`. Acepta strings arbitrarios en campos de email y teléfono sin formato ni tipo HTML semántico.

### BUG-020 · P2 · Deduplicación de clientes existe en código pero nunca se ejecuta (`CODE_ONLY`)
- **Archivos:** `src/services/customerMatchingService.js:5-27`, `src/admin/components/crm/NewCustomerModal.jsx:20-25`
- **Mecánica:** `findCustomerByContact` y `findOrCreateCustomer` fueron creados para evitar duplicados por email o teléfono normalizado (`bloque 57: no permitir clientes duplicados`). Sin embargo, `NewCustomerModal` **no importa ni invoca este servicio**: inserta directamente un nuevo registro con `createCustomer`.
- **Impacto:** Se pueden registrar ilimitadas fichas para un mismo cliente con el mismo email o teléfono. El sistema fragmenta el historial de visitas, el saldo de puntos y las métricas de consumo de la persona.
