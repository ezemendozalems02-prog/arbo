# ARBO OS — FASE 4: CONCURRENCIA E IDEMPOTENCIA EN PANTALLAS KDS

---

## 1. EL PROBLEMA DE LA CONCURRENCIA EN PANTALLAS TÁCTILES

En una cocina de alta demanda con múltiples tablets o cocineros:
- Tablet A pulsa "Preparar" sobre el Ticket #4.
- Tablet B pulsa "Preparar" una fracción de segundo después sobre el mismo Ticket #4.

---

## 2. SOLUCIÓN IMPLEMENTADA

1. **Idempotencia de Estado:**
   - La función PostgreSQL `transition_kitchen_ticket_status(...)` y la función de dominio `transitionTicketStatus(...)` validan el estado actual.
   - Si el ticket ya se encuentra en `PREPARING`, el segundo llamado se resuelve como un **`IDEMPOTENT_NOOP` (éxito sin mutación adicional)**, en lugar de lanzar una excepción que congele la interfaz.
2. **Serialización Segura:**
   - En PostgreSQL, la sentencia `SELECT * FROM kitchen_tickets WHERE id = p_ticket_id FOR UPDATE` garantiza que dos peticiones simultáneas se procesen ordenadamente sin riesgo de estado corrupto.
