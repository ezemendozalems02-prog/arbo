# ARBO OS — FASE 10: CAJA Y PAGOS EN MODO OFFLINE
## Preservación del Ledger de Caja

### 1. Pagos en Efectivo
Durante contingencias de conectividad, el medio de pago primario habilitado es el efectivo (cash).
Los pagos digitales (Mercado Pago, tarjetas online) que exijan tokenización externa en tiempo real requieren conectividad o terminal POS física bancaria independiente (Lapós / Clover).

### 2. Consistencia Append-Only
El movimiento de caja asociado a la venta offline se crea con tipo `SALE` y monto exacto cobrado. Se almacena en la cola transaccional vinculado a la venta, garantizando que al sincronizar se asiente en el `cash_movements` central sin alterar el balance de turnos de caja anteriores.
