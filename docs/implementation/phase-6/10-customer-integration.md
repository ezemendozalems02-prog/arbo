# ARBO OS — FASE 6: INTEGRACIÓN CON CUSTOMERS & CRM
## ASOCIACIÓN DE CLIENTES & UNIFICACIÓN DE HISTORIAL

---

## 1. VINCULACIÓN CON LA FICHA DEL CLIENTE

Cada orden pública se vincula a un registro en `customers`:
- Si el cliente ya había comprado previamente en el salón físico o en otra sucursal de la misma organización, la venta online se asocia a su mismo `customer_id`.
- La vista de **Customer 360** refleja inmediatamente la nueva compra sin requerir sincronizaciones batch.

---

## 2. IMPACTO EN MÉTRICAS RFM

La orden online confirmada impacta de forma automática en el modelo RFM:
- **Recency**: Se actualiza a la fecha del pedido online (0 días).
- **Frequency**: Se incrementa en +1.
- **Monetary**: Suma el importe del pedido al gasto total acumulado.
- **Productos Favoritos**: Los productos adquiridos online se contabilizan en el desglose de productos preferidos del cliente.
