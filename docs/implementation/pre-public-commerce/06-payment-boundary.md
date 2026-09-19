# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 06. FRONTERA DE PAGOS ONLINE (PAYMENT BOUNDARY)

---

## 1. DESACOPLAMIENTO DE PASARELAS DE PAGO

El sistema ARBO OS debe mantener su núcleo transaccional desacoplado de las librerías propietarias de cualquier pasarela (Mercado Pago, Stripe, Modo, etc.).

### Principio de Diseño:
- El Gateway de Pago es un **proveedor de cobro asíncrono**, no el árbitro de la base de datos de ARBO OS.
- Toda comunicación del gateway hacia ARBO OS ingresa mediante un **Webhook de Cobro Firmado**.

---

## 2. CICLO DE VIDA Y CONDICIONES DE BORDE

### Caso A: Pago Aprobado Normal
1. Orden pública en estado `PAYMENT_PENDING`.
2. Webhook notifica cobro exitoso con `payment_id`.
3. Backend valida la firma criptográfica del webhook.
4. Se ejecuta `execute_sale_checkout` en bloque ACID.
5. Orden pública pasa a `CONFIRMED`.

### Caso B: El Cobro Tiene Éxito pero Falla la Venta en ARBO OS (Edge Case Crítico)
- *Ejemplo*: Se agotó el stock en mostrador mientras el cliente pagaba en la web, o la caja del local fue cerrada intempestivamente.
- *Solución Requerida*:
  - La transacción de venta falla (`ROLLBACK`).
  - La orden pública queda en estado `PAYMENT_FAILED_NEEDS_REFUND`.
  - Se genera una alerta inmediata al cajero/administrador y un registro en la cola de devoluciones automáticas.
  - **Nunca** se debe dejar al cliente con el dinero cobrado sin aviso o con stock negativo forzado.

### Caso C: Webhook Repetido (Replay)
- El gateway reenvía el webhook tras 5 segundos.
- La tabla de pagos detecta `external_reference` o `payment_id` ya aplicado.
- Responde `HTTP 200` inmediatamente sin generar una segunda venta.
