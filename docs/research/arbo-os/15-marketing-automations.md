# 15 — Marketing y Automatizaciones

**Rutas:** `/admin/marketing/campanas`, `/admin/marketing/campanas/:id`, `/admin/automatizaciones`  
**Archivos:** `src/admin/pages/marketing/Campaigns.jsx`, `CampaignDetail.jsx`, `Automations.jsx`, `src/services/campaignService.js`, `campaignTemplateService.js`, `automationService.js`, `customerEventService.js`, `src/context/CRMContext.jsx`  
**Estado general:** `UI_ONLY` / `SIMULATED` — estructura visual y lógica de targeting por segmentos impecable; todos los envíos de campañas y disparos de automatización son **simulaciones con números aleatorios en cliente** sin ningún canal de mensajería real (WhatsApp / Email / SMS).

---

## 15.1 Campañas de Mensajería

### Capacidades Verificadas
- **Creación de campaña:** Nombre, canal (`whatsapp`, `email`), segmento destinatario, asunto y mensaje con variables (`{{nombre}}`, `{{puntos}}`).
- **Vista previa de audiencia (`previewAudience`):** Calcula dinámicamente cuántos clientes cumplen las condiciones del segmento y muestra una muestra de 5 destinatarios.
- **Acción de "Enviar campaña":**
  ```js
  // campaignService.js:17-22
  function buildStats(reached) {
    const opens = Math.round(reached * (0.35 + Math.random() * 0.3))
    const clicks = Math.round(opens * (0.2 + Math.random() * 0.25))
    const redemptions = Math.round(clicks * (0.1 + Math.random() * 0.2))
    return { reached, opens, clicks, redemptions, conversion: reached ? Math.round((redemptions / reached) * 1000) / 10 : 0 }
  }
  ```
- **FACT · SIMULATED:** `simulateSend` cambia el estado a `COMPLETED`, sella la fecha `sentAt` y genera métricas de apertura/clics inventadas mediante `Math.random()`. No existe llamada a Meta Graph API, Twilio, Resend, SendGrid ni backend intermedio.
- **Trazabilidad:** La campaña enviada se refleja en el timeline del cliente a través de `customerEventService.js:30-32`.

---

## 15.2 Automatizaciones de Fidelización

### Reglas y Triggers Declarados (`src/mock/automations.js`, `automationService.js`)
1. `CUSTOMER_CREATED` (Bienvenida a nuevos clientes).
2. `FIRST_PURCHASE` (Agradecimiento post primera compra).
3. `RESERVATION_COMPLETED` (Encuesta de satisfacción post cena).
4. `BIRTHDAY` (Regalo o saludo de cumpleaños).
5. `CUSTOMER_INACTIVE` (Recuperación de clientes inactivos > 30/60 días).
6. `REWARD_UNLOCKED` (Aviso de puntos suficientes para un beneficio).
7. `POINTS_EXPIRING` (Alerta de vencimiento próximo de puntos).

### Análisis Técnico de la Ejecución
- **Acción "Ejecutar ahora" (`simulateRun`):** Evalúa sincrónicamente los clientes en memoria que satisfacen el trigger y agrega un log a `automationRuns` con `matchedCount` y nombres de muestra.
- **BUG-023 · P2 · Automatizaciones leen de mocks estáticos en vez del estado en vivo:**
  `automationService.js:4-5` importa `ORDERS` y `REDEMPTIONS` directamente desde `src/mock/`. No consulta las ventas reales de `POSContext.sales` ni los canjes vivos de `CRMContext.redemptions`. Como consecuencia, una venta confirmada en el POS nunca hace que un cliente califique para el trigger `PURCHASE_COMPLETED` o `FIRST_PURCHASE`.
- **Ausencia de Scheduler / Workers (`NOT_IMPLEMENTED`):** Al ser una SPA en el navegador del cliente, no existe ningún cron job, temporizador en segundo plano ni cola de tareas (BullMQ/QStash). Si la pestaña se cierra, ninguna automatización se evalúa ni se dispara.

---

## 15.3 Resumen de Brechas (Gaps)

| Componente | Promesa de UI | Realidad Técnica | Estado |
|---|---|---|---|
| Envío WhatsApp | Botón "Enviar" con logo WhatsApp | `simulateSend` con `Math.random()` | `SIMULATED` |
| Envío Email | Envío masivo con tasa de rebote | `simulateSend` sin cliente SMTP/API | `SIMULATED` |
| Disparador automático de cumpleaños | Envío en la fecha de cumpleaños | Evaluación manual mediante botón | `UI_ONLY` |
| Disparador post-visita | Disparo al cobrar comanda | Desconectado del POS | `BROKEN` |
| Opt-out / Desuscripción | Respeto de consentimientos | `consent` se almacena pero `simulateSend` no lo filtra | `INCOMPLETE` |
