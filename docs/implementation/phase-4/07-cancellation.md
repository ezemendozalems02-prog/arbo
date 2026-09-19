# ARBO OS — FASE 4: POLÍTICA DE CANCELACIONES Y COMPENSACIONES

---

## 1. REGLAS DE CANCELACIÓN EN KDS

Las comandas **NUNCA se eliminan físicamente (`DELETE`)** de la base de datos.
Toda cancelación se registra mediante el estado terminal `CANCELLED` preservando:
- `cancelled_at`: Timestamp exacto de la cancelación.
- `cancelled_by`: UUID del usuario responsable.
- `cancel_reason`: Motivo explícito (ej. "Cliente desistió", "Plato duplicado por error").

---

## 2. MATRIZ DE COMPORTAMIENTO SEGÚN ESTADO

| Estado al Cancelar | Acción en Cocina | Impacto en Inventario |
| :--- | :--- | :--- |
| **`NEW`** | Se tacha la comanda de inmediato. No se inicia preparación. | Se puede reponer el insumo mediante movimiento compensatorio (`ADJUSTMENT_IN`). |
| **`PREPARING`** | Alerta visual y sonora en KDS para detener la cocción de inmediato. | El producto ya se elaboró parcialmente: se reclasifica el consumo como `WASTE` (merma). |
| **`READY`** | Alerta de retiro cancelado en el pase. | Se registra como `WASTE` (comida elaborada descartada). |
| **`ARCHIVED`** | Venta ya entregada. No admite cancelación operativa en KDS; requiere gestión de devolución comercial en caja. |
