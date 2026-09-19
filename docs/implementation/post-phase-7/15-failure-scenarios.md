# ARBO OS — POST-PHASE 7 CHECKPOINT
## 15. AUDITORÍA DE ESCENARIOS DE FALLA (FAILURE SCENARIOS)

---

## 1. COMPORTAMIENTO SISTÉMICO ANTE FALLAS

| Escenario de Falla | Comportamiento del Sistema | Resultado en Venta / Caja |
| :--- | :--- | :--- |
| **Timeout AFIP (>3.5s)** | Interrumpe request externo; crea comprobante `PENDING_CONTINGENCY` y encola en `fiscal_contingency_queue`. | **Venta intacta**, caja cobrada, stock consumido. |
| **Caída AFIP (HTTP 503)** | Capturado inmediatamente; encola para resolución diferida. | **Venta intacta**, sin bloqueo del salón. |
| **Rechazo AFIP (Error 10014 CUIT)** | Comprobante queda en `REJECTED` con diagnóstico formal para subsanación del cajero. | **Venta cobrada**, permite reemitir Factura B. |
| **Fallo en Gateway WhatsApp** | Capturado dentro de `dispatchDomainEvent`; auditoría registra `status: 'FAILED'`. | **Venta y cobro intactos**, failure isolation total. |
| **Reenvío Duplicado de Venta** | Constraint única `uq_fiscal_invoice_sale_type` o chequeo de idempotencia devuelven factura existente. | Cero comprobantes duplicados. |
| **Fallo Acumulado en Contingencia** | Tras 5 reintentos fallidos, la cola transiciona a `FAILED_PERMANENT`. | Alerta visible en Dashboard para el administrador/contador. |
