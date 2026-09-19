# ARBO OS — POST-PHASE 6 CHECKPOINT
## 11. VALIDACIÓN DE IDEMPOTENCIA EN TRES ESCENARIOS CRÍTICOS

---

## 1. ESCENARIOS AUDITADOS

Se verificó el comportamiento del sistema ante las tres fuentes típicas de duplicación:

### Escenario A: Doble Clic del Usuario
- El cliente pulsa dos veces consecutivas "Confirmar Pedido".
- Ambas peticiones portan la misma `idempotency_key`.
- **Resultado**: La segunda petición detecta la orden ya registrada en `public_orders` y retorna la misma instancia con `isDuplicate: true`. No se crea una segunda orden.

### Escenario B: Reintento por Timeout de Red (Retry HTTP)
- El navegador reenvía el request tras 5 segundos de espera.
- La base de datos aplica `uq_public_orders_org_idempotency` garantizando que no se genere un segundo registro en `public_orders` ni en `public_order_items`.

### Escenario C: Reintento de Confirmación a Venta
- Un intento de confirmar nuevamente una orden que ya tiene `status == 'CONFIRMED'` es abortado con la excepción:
  ```
  INVALID_ORDER_STATUS: La orden se encuentra en estado CONFIRMED y no puede ser confirmada.
  ```
- No se genera una segunda venta, un segundo cobro en caja, una segunda comanda en KDS ni una segunda acreditación de puntos en ARBO Club.
