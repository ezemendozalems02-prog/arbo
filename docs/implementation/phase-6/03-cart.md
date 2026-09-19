# ARBO OS — FASE 6: CARRITO PÚBLICO & BLINDAJE DE CÁLCULO
## PREVIEW EN CLIENTE vs AUTORIDAD EN SERVIDOR

---

## 1. PREVIEW EN CLIENTE (UX ÁGIL)

El carrito de compras (`CartContext.jsx` y componentes del frontend) ofrece al usuario una experiencia reactiva instantánea:
- Agregar productos y seleccionar cantidades.
- Instrucciones especiales y notas de preparación.
- Cálculo provisional de subtotal y total para visualización rápida.

---

## 2. EL BACKEND ES LA ÚNICA AUTORIDAD

**Regla de Oro**: Ningún valor monetario proveniente del navegador es de confianza.

Cuando el usuario procede a confirmar el pedido, la función `calculateAndValidateCart(state, ...)` ejecuta una verificación integral en el servidor:
1. **Existencia**: Verifica que cada `productId` exista en el catálogo de la organización.
2. **Disponibilidad**: Exige que `is_available === true` e `is_active === true`.
3. **Precio Oficial**: Obtiene el `base_price` directamente de la base de datos persistente.
4. **Detección de Manipulación (Price Tampering)**: Si el cliente envía un precio alterado (ej. `$1` en lugar de `$3.500`), el servidor detecta la discrepancia y aborta con `PRICE_TAMPERING_DETECTED`.
5. **Cálculo Determinista**: El backend computa los subtotales de cada línea y el total general, congelándolos en la orden.
