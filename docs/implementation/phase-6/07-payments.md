# ARBO OS — FASE 6: FRONTERA DE PAGOS (PAYMENT BOUNDARY)
## MODALIDADES DE PAGO EN COMMERCE PÚBLICO

---

## 1. MODALIDAD IMPLEMENTADA EN FASE 6: PAY ON PICKUP

Para esta fase, el flujo comercial se basa en la modalidad estándar de cafeterías de especialidad y takeaway:
- **`PAY_ON_PICKUP` / `CASH`**: El cliente encarga su pedido online y abona en mostrador al momento de retirar.
- **Preparación Inmediata**: La orden ingresa al sistema y emite comanda en cocina/barra para que esté lista a la llegada del cliente.

---

## 2. ARQUITECTURA PREPARADA PARA GATEWAYS ONLINE

La tabla `public_orders` incluye los campos necesarios para pasarelas futuras (Mercado Pago, Stripe, Modo):
- `payment_method`: `PAY_ON_PICKUP`, `CASH`, `CARD`, `ONLINE`.
- `payment_status`: `PENDING`, `PAID`, `FAILED`.

### Ciclo de Vida Futuro:
1. `public_orders.status = 'PENDING'`, `payment_status = 'PENDING'`.
2. El webhook de la pasarela notifica aprobación con firma criptográfica.
3. Se ejecuta `confirmPublicOrderToSale(...)` acreditando el cobro en el arqueo del local.
4. Si el pago es rechazado, la orden se cancela sin tocar el stock ni emitir comandas a cocina.
