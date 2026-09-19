# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 13. PIPELINE DE EVENTOS & AISLAMIENTO DE FALLOS

---

## 1. EVENTOS OFICIALES DEL SISTEMA
El pipeline opera de forma liviana y síncrona/desacoplada sobre los hitos del ciclo comercial:
- `sale.completed`: Venta finalizada y cobrada en el salón.
- `order.created`: Pedido online recibido desde el catálogo web.
- `payment.completed`: Cobro acreditado en caja o pasarela.
- `customer.created`: Registro o primer checkout de un nuevo cliente.
- `fiscal.invoice_issued`: Factura autorizada exitosamente por AFIP.

## 2. REGLA DE ORO: AISLAMIENTO DE FALLOS (FAILURE ISOLATION)
Las automatizaciones son **efectos colaterales (side effects)** y nunca deben condicionar la validez de la transacción comercial principal.
- Si la API de mensajería (WhatsApp, email o gateway) falla, la venta NO hace rollback.
- El error es capturado dentro de un bloque `try / catch` en `dispatchDomainEvent`.
- Se graba el estado `FAILED` con su diagnóstico en `automation_executions` y se retorna el control limpio al hilo principal de ventas.
