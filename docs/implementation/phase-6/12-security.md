# ARBO OS — FASE 6: SEGURIDAD & PREVENCIÓN DE VULNERABILIDADES
## BLINDAJE DE COMMERCE PÚBLICO

---

## 1. CONTROL DE AMENAZAS EN LA EXPOSICIÓN PÚBLICA

La Fase 6 implementa defensas exhaustivas contra las principales vulnerabilidades de comercio online:

1. **Ataques IDOR en Tracking de Pedidos**:
   - Se utiliza un `public_token` criptográfico aleatorio de más de 24 caracteres (ej. `ord_sec_mn48...`).
   - Queda totalmente prohibido el tracking por IDs numéricos secuenciales (`/order/1`, `/order/2`).
2. **Manipulación de Precios (Price Tampering)**:
   - El backend recalcula los precios consultando directamente `products.base_price` en base de datos.
   - Si un atacante modifica el payload local con `clientPrice = 1`, la transacción aborta inmediatamente con `PRICE_TAMPERING_DETECTED`.
3. **Fuga de Datos Sensibles (PII)**:
   - La pantalla de seguimiento enmascara el teléfono del cliente (`+54 9 341 ***-1234`).
   - No se expone información de otros clientes ni historial de compras.
4. **Tenant Hopping**:
   - La verificación de carrito exige que todos los `productId` pertenezcan a la `organization_id` de la sucursal seleccionada.
