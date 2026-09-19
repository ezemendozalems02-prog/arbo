# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 11. REGLAS DE AUTOMATIZACIÓN OPERATIVA (`automation_rules`)

---

## 1. PROPÓSITO
Permitir a la organización definir disparadores automáticos basados en eventos del ciclo de vida comercial (ej. venta finalizada, pedido online creado, comprobante fiscal emitido) para ejecutar acciones operativas sin intervención manual.

## 2. ESQUEMA DE DATOS
- `id`: UUID Primary Key.
- `organization_id`: Tenant propietario.
- `name`: Nombre descriptivo (ej. "Envío de Ticket Digital").
- `event_type`: Evento que suscita la regla (`sale.completed`, `order.created`, `customer.created`, `fiscal.invoice_issued`).
- `condition`: JSONB con predicados de filtro (ej. `{ "total": { "$gte": 10000 } }`).
- `action_type`: Tipo de acción a disparar (`SEND_DIGITAL_TICKET`, `NOTIFY_STAFF`, `LOG_AUDIT`).
- `action_config`: Parámetros específicos de la acción.
- `is_enabled`: Boolean para pausar o activar la regla.

## 3. AISLAMIENTO MULTI-TENANT
Cada tenant gestiona únicamente sus propias reglas. Las políticas RLS impiden que eventos de una organización disparen reglas configuradas por otra.
