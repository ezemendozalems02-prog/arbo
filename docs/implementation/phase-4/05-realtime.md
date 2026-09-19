# ARBO OS — FASE 4: TRANSPORTE REALTIME Y ESTRATEGIA DE FALLBACK

---

## 1. SUPABASE REALTIME (TRANSPORTE)

- **Principio:** Supabase Realtime es un canal de transporte reactivo, **NO la fuente de verdad**. La fuente de verdad inmutable es siempre PostgreSQL.
- **Mecanismo:** Suscripción CDC (Change Data Capture) sobre `kitchen_tickets`:
  - Evento `INSERT`: Renderizado instantáneo de la comanda en la columna "Nuevos".
  - Evento `UPDATE`: Desplazamiento automático de la tarjeta a la columna correspondiente ("En Preparación", "Listos", "Archivados").

---

## 2. FALLBACK POR POLLING PERIÓDICO

Para garantizar que el KDS jamás quede ciego ante micro-cortes de WebSocket o reconexiones de red WiFi en la cocina:
1. **Intervalo:** Polling periódico cada **5 segundos** (`5000ms`).
2. **Deduplicación:** La función de dominio `deduplicateTickets(existing, incoming)` fusiona por ID único, actualizando a la versión más reciente sin generar tarjetas repetidas en pantalla.
3. **Reconexión Transparente:** Al reestablecerse el WebSocket de Realtime, el sistema continúa recibiendo eventos push sin duplicación.
