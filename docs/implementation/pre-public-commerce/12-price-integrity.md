# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 12. INTEGRIDAD DE PRECIOS & BLINDAJE CONTRA MANIPULACIÓN

---

## 1. LA REGLA DE ORO: EL CLIENTE NUNCA ES FUENTE DE VERDAD

En una aplicación web pública, **nunca se debe confiar en los precios, subtotales o totales enviados por el frontend**.

### Escenario de Ataque Común:
Un usuario malicioso abre las Developer Tools de su navegador o usa herramientas como Postman/Curl para enviar:
```json
{
  "items": [
    {
      "productId": "prod_espresso_01",
      "quantity": 1,
      "unit_price": 1.00,
      "subtotal": 1.00
    }
  ],
  "total": 1.00
}
```

Si el servidor acepta ciegamente el campo `total`, el cliente cobraría un café de $3.500 a $1.

---

## 2. ESTRATEGIA DE RECALCULO OBLIGATORIO EN BACKEND

Al recibir la orden pública:
1. El backend recibe únicamente un array de `{ product_id, quantity, modifier_ids }`.
2. El servidor consulta la tabla `products` en la base de datos:
   ```sql
   SELECT id, base_price, is_active FROM public.products WHERE id = ANY(p_product_ids) AND organization_id = p_org_id;
   ```
3. El servidor calcula:
   - `subtotal = SUM(product.base_price * quantity)`.
   - Aplica descuentos si existen reglas válidas del sistema.
   - `total = subtotal - discount_amount + delivery_fee`.
4. Si el cliente envió un total en el payload para verificar consistencia, el servidor compara:
   ```javascript
   if (Math.abs(calculatedTotal - clientTotal) > 0.01) {
     throw new Error('PRICE_MISMATCH: El total enviado difiere del valor oficial del catálogo.')
   }
   ```
5. El valor congelado en `public_order_items.unit_price_snapshot` y `public_orders.total` es **exclusivamente el valor calculado por el backend**.
