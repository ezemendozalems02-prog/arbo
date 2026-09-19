# ARBO OS — FASE 6: TRANSACCIÓN ACID: PUBLIC ORDER → SALE
## CONVERSIÓN INDIVISIBLE AL NÚCLEO OPERATIVO

---

## 1. PRINCIPIO: NUNCA DUPLICAR EL MOTOR TRANSACCIONAL

En lugar de crear una segunda rutina de inserción de ventas para pedidos web, ARBO OS integra los pedidos públicos directamente en el motor transaccional indivisible existente: `execute_sale_checkout(...)` / `executeSaleCheckoutAtomic`.

```mermaid
graph TD
    PO[Public Order PENDING] --> Trigger[Confirmación / Pago Aprobado]
    Trigger --> Core[execute_sale_checkout]
    Core --> S1[Insert Sale]
    Core --> S2[Insert Sale Items]
    Core --> S3[Insert Payment]
    Core --> S4[Insert Cash Movement]
    Core --> S5[Explosión de Recetas & Depleción de Stock]
    Core --> S6[Insert Kitchen Ticket KDS]
    Core --> S7[Insert Loyalty EARN en Ledger]
    Core --> Commit[COMMIT ACID]
    Commit --> UpdatePO[Public Order -> CONFIRMED & sale_id vinculado]
    Core -. Error en cualquiera .-> Rollback[ROLLBACK TOTAL]
```

---

## 2. GARANTÍAS ACID CERTIFICADAS

1. **Atomicidad Absoluta**:
   - Venta + Pago + Inventario + Caja + KDS + Loyalty se ejecutan o revierten como una sola unidad.
2. **Consistencia de Inventario**:
   - Si no hay suficiente café en grano para el pedido online, la transacción falla con `INSUFFICIENT_STOCK`, evitando vender stock inexistente.
3. **Idempotencia de Confirmación**:
   - Una orden pública sólo puede confirmarse una vez. Intentos subsecuentes detectan `status !== 'PENDING'` y rechazan la duplicación.
