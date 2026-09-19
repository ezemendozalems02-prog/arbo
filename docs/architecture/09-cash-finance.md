# 09 — ARQUITECTURA FINANCIERA DE CAJA Y CONTROL DE TURNOS

---

## 1. CICLO DE VIDA DE UNA SESIÓN DE CAJA (CASH SHIFT)

El control del dinero en efectivo y medios de pago se estructura bajo una máquina de estados determinística:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CICLO DE VIDA DEL TURNO DE CAJA                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. APERTURA (OPENING)                                                  │
│    - Asignación de cajero responsable                                  │
│    - Conteo obligatorio de fondo inicial de cambio (Fondo de Caja)     │
│    - Creación de registro inmutable en 'cash_shifts' (Status: OPEN)    │
├────────────────────────────────────────────────────────────────────────┤
│ 2. OPERACIÓN TRANSACCIONAL                                             │
│    - Asientos automáticos de ventas (Efectivo, Tarjetas, MP)           │
│    - Asientos manuales autorizados (Ingreso de cambio, Pago de gastos) │
│    - Inserción append-only continua en 'cash_movements'                │
├────────────────────────────────────────────────────────────────────────┤
│ 3. ARQUEO CIEGO (BLIND CASH COUNT)                                     │
│    - El cajero ingresa el desglose físico de billetes y comprobantes   │
│    - LA INTERFAZ OCULTA EL SALDO TEÓRICO DEL SISTEMA                   │
├────────────────────────────────────────────────────────────────────────┤
│ 4. CIERRE FORMAL (CLOSING)                                             │
│    - El servidor calcula: Teórico = Fondo Inicial + Ingresos - Egresos │
│    - El servidor calcula: Discrepancia = Declarado - Teórico           │
│    - Transición a Status: CLOSED con firma digital y timestamp         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. RESOLUCIÓN DEFINITIVA DEL BUG-018: INMUTABILIDAD HISTÓRICA

### 2.1. El Fallo Detectado en la Auditoría
En el prototipo previo (`src/pages/Caja.jsx`), al reabrir una caja para corregir una venta, el sistema eliminaba o sobreescribía los movimientos anteriores, destruyendo la trazabilidad contable (`[FACT: BUG-018]`).

### 2.2. La Solución Arquitectónica
- **Prohibición de `DELETE` y `UPDATE`:** La tabla `cash_movements` no admite operaciones de borrado ni modificación.
- **Protocolo de Reapertura Excepcional:**
  1. Si un administrador reabre un turno cerrado, la base de datos **NO borra** ningún movimiento previo.
  2. Se registra un movimiento de auditoría especial: `movement_type = 'SHIFT_REOPENED'`, vinculando el ID del administrador que lo autorizó y la justificación obligatoria.
  3. Toda corrección posterior se asienta como un nuevo movimiento compensatorio con signo inverso.

---

## 3. PROTOCOLO DE ARQUEO CIEGO (BLIND COUNT)

Para evitar la manipulación de saldos por parte del personal, el sistema impone la siguiente regla de seguridad en el backend:

1. **Captura sin Revelación:** La pantalla de cierre de caja solicita al cajero:
   - Cantidad de billetes por denominación ($20.000, $10.000, $2.000, $1.000, etc.).
   - Total de cupones de tarjeta de débito/crédito.
   - Total de comprobantes de transferencias / QR recibidos.
2. **Cálculo Autorizado en Servidor:** El cálculo del saldo teórico se realiza en el backend mediante la función:
   $$\text{Saldo Teórico} = \text{Fondo Inicial} + \sum \text{Ventas Efectivo} + \sum \text{Ingresos Manuales} - \sum \text{Egresos Manuales}$$
3. **Determinación de Discrepancia:**
   $$\text{Discrepancia} = \text{Efectivo Declarado} - \text{Saldo Teórico Efectivo}$$
   - Si $\text{Discrepancia} = 0$: Arqueo exacto.
   - Si $\text{Discrepancia} > 0$: Sobrante de caja (posible cobro no registrado).
   - Si $\text{Discrepancia} < 0$: Faltante de caja (pérdida o error de vuelto).

---

## 4. SOPORTE DE MÚLTIPLES CAJAS CONCURRENTES EN UNA SUCURSAL

Un restaurante de mediano porte puede operar concurrentemente:
- **Caja 1 (Caja Principal / Mostrador):** Cobro de pedidos takeaway y salón.
- **Caja 2 (Barra):** Cobro directo de bebidas y cafetería.

Cada caja física (`cash_registers`) mantiene su propia sesión independiente (`cash_shifts`), garantizando que las discrepancias de un cajero no contaminen la responsabilidad del otro.
