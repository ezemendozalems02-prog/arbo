# ARBO OS — POST-PHASE 6 CHECKPOINT
## 06. VALIDACIÓN DEL MODELO DE CAJA & ARQUEO DE TURNOS

---

## 1. INTEGRACIÓN CON EL LIBRO MAYOR DE CAJA

Se auditó que los pedidos online bajo modalidad `PAY_ON_PICKUP` o cobro efectivo en mostrador utilicen estrictamente la infraestructura contable de Fase 3:
- Entidades involucradas:
  - `cash_registers` (Punto de venta físico asignado).
  - `cash_sessions` (Sesión de turno activa en estado `OPEN`).
  - `cash_movements` (Movimiento de tipo `SALE`).

---

## 2. RESULTADOS NUMÉRICOS AUDITADOS

- **Monto de Apertura de Caja**: `$10.000,00 ARS`.
- **Venta Online Confirmada**: `$5.300,00 ARS` (1 Espresso Doble $3.500 + 1 Medialuna $1.800).
- **Saldo en Caja Resultante**: `$15.300,00 ARS`.
- **Cero cajas paralelas**: No se crea ningún libro mayor alternativo para ventas online. Todo el dinero queda debidamente registrado en el arqueo del cajero en turno.
