# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 05. ESTRATEGIA DE IDEMPOTENCIA EN PEDIDOS PÚBLICOS

---

## 1. ESCENARIOS CRÍTICOS DE RIESGO DE DUPLICACIÓN

En el comercio electrónico abierto, los pedidos sufren frecuentemente de multiplicidad de señales:
1. **Doble clic del cliente**: El usuario pulsa con impaciencia "Confirmar Pedido" dos veces consecutivas en su smartphone.
2. **Reintentos de red del navegador**: Pérdida momentánea de señal 4G que reenvía el request HTTP tras un timeout.
3. **Reenvío de Webhooks**: La pasarela de pagos reintenta notificar la aprobación del pago 3 veces seguidas hasta recibir un `HTTP 200 OK`.
4. **Refresco de página**: El usuario presiona F5 en la pantalla de espera tras pagar.

---

## 2. ESTRATEGIA ARQUITECTÓNICA REQUERIDA

Fase 6 deberá adoptar una estrategia de idempotencia en tres niveles:

### Nivel 1: Idempotency Key en Frontend
- Al abrir la pantalla de checkout, el navegador genera un `client_order_id` (UUID v4) único.
- Si el usuario presiona varias veces el botón o la conexión reintenta, el payload lleva la misma clave.

### Nivel 2: Constraint de Base de Datos en `public_orders`
```sql
CONSTRAINT uq_public_order_idempotency UNIQUE (organization_id, idempotency_key)
```
- Si un segundo request llega con la misma clave, el backend detecta la orden ya existente y retorna el estado actual sin crear una segunda orden.

### Nivel 3: Deduplicación de Webhook y Transacción Core
- Para el cobro y conversión a venta:
```sql
CONSTRAINT uq_sale_external_order UNIQUE (organization_id, external_order_id)
```
- Al procesar el webhook del gateway:
  - Si el pago ya fue imputado, se retorna `200 OK` inmediatamente (no-op idempotente).
  - Nunca se dispara dos veces la comanda KDS, nunca se descuenta el stock dos veces y nunca se acreditan puntos dos veces.
