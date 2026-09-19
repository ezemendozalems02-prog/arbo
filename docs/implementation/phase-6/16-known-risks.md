# ARBO OS — FASE 6: RIESGOS CONOCIDOS & CONSIDERACIONES
## LIMITACIONES ACTUALES DE PUBLIC COMMERCE

---

## 1. RIESGOS IDENTIFICADOS Y ALCANCE

1. **Sin Pasarela de Pagos Online en Fase 6**:
   - Actualmente opera bajo modalidad `PAY_ON_PICKUP` (pago en mostrador al retirar). La integración de SDKs externos (Mercado Pago / Stripe) queda reservada para la fase de medios de pago integrados.
2. **Sin Ruteo de Delivery con Geolocalización**:
   - Se admite captura de dirección para Takeaway/Delivery, pero no incluye cálculo dinámico de costo por kilómetro ni asignación de repartidores en tiempo real.
3. **Sin Notificaciones Push Salientes (WhatsApp / SMS)**:
   - El seguimiento de pedidos se realiza mediante la página web `/order/:token` en tiempo real. No se disparan mensajes automatizados por WhatsApp Business API.
