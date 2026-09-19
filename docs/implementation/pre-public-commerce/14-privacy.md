# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 14. PRIVACIDAD & GESTIÓN DE DATOS PERSONALES EN EL COMMERCE PÚBLICO

---

## 1. PII CAPTURADA EN PEDIDOS PÚBLICOS

El flujo de pedidos online recolecta los siguientes datos del comprador:
- **Nombre y Apellido**: Para llamar al cliente en mostrador o rotular la comanda.
- **Teléfono**: Para asociar al cliente en ARBO Club, enviar confirmaciones de despacho y resolver incidencias de entrega.
- **Email (Opcional)**: Para envío de comprobantes electrónicos.
- **Dirección de Entrega (En fulfillment Takeaway/Delivery)**: Calle, número, departamento y notas de acceso.
- **Notas Especiales**: Indicaciones dietarias o alergias.

---

## 2. POLÍTICA DE RESGUARDO & ENCRIPTACIÓN

1. **Minimización de Datos en Pantallas Públicas**:
   - En la pantalla de seguimiento del pedido (`/orden/:id/tracking`), el número de teléfono y el email deben mostrarse ofuscados (ej. `+54 9 341 ***-0000`, `d***o@arboclub.com`).
   - La dirección completa sólo se muestra al cliente si el token de tracking es válido.
2. **Tokens de Tracking Efímeros / Criptográficos**:
   - El acceso al estado del pedido no debe depender únicamente del ID secuencial (#1042), sino de un token unívoco (ej. `UUID` secreto o hash HMAC) enviado en la URL de confirmación.
3. **No Indexación por Motores de Búsqueda**:
   - Las rutas de tracking y pedidos deben incluir etiquetas `meta name="robots" content="noindex, nofollow"`.
4. **Logs Sanitizados**:
   - Ningún log de servidor en producción debe volcar tarjetas de crédito, tokens de pago ni datos sensibles no ofuscados.
