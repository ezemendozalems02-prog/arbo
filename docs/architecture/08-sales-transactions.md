# 08 — PIPELINE DE TRANSACCIONES DE VENTA Y GARANTÍAS ACID

---

## 1. EL PIPELINE TRANSACCIONAL DE VENTA

El proceso de cobro y liquidación de una orden es la operación de mayor criticidad del sistema. A diferencia del prototipo anterior, donde cada paso ocurría de manera desarticulada en el cliente, la arquitectura objetivo consolida el flujo bajo un **Pipeline Transaccional en Servidor**:

```
[1. Solicitud de Cobro POS / Checkout Web]
         │  (Incluye Idempotency-Key UUID)
         ▼
[2. Verificación de Integridad Financiera]
   (Total Orden == Suma de Pagos)
         │
         ▼
┌────────────────────────────────────────────────────────┐
│              BLOQUE TRANSACCIONAL ACID ATÓMICO         │
│               (PostgreSQL BEGIN ... COMMIT)            │
├────────────────────────────────────────────────────────┤
│ A. Actualizar orden a 'SETTLED' con timestamp oficial  │
│ B. Insertar registros en tabla 'payments'              │
│ C. Insertar egresos en 'cash_movements' (Caja abierta) │
│ D. Ejecutar explosión de recetas en 'inventory_movem.' │
│ E. Insertar puntos ganados en 'loyalty_transactions'   │
└───────────────────────────┬────────────────────────────┘
                            │  COMMIT EXITOSO
                            ▼
[3. Emisión de Evento: OrderSettledEvent]
         │
         ├─────────────────────────────────┬─────────────────────────────────┐
         ▼                                 ▼                                 ▼
[4. KDS Realtime]                 [5. Emisión Fiscal]               [6. Async Analytics]
 Archiva ticket de cocina          Genera comprobante AFIP           Actualiza RFM y métricas
 (WebSocket broadcast)             (Sync o Contingencia)             (Worker Queue)
```

---

## 2. GARANTÍAS ACID Y LÍMITES ATÓMICOS

### 2.1. Operaciones Estrictamente Atómicas (Todo o Nada)
Las siguientes 5 mutaciones deben ejecutarse dentro de la **misma transacción SQL**. Si cualquiera de ellas falla, se ejecuta un `ROLLBACK` completo y el estado del sistema vuelve al momento exacto previo al cobro:
1. Cambio de estado de la orden: `status = 'SETTLED'`.
2. Asiento de los pagos recibidos (efectivo, tarjeta, QR): `INSERT INTO payments`.
3. Asiento del movimiento en la caja del turno activo: `INSERT INTO cash_movements`.
4. Descarga de inventario por recetas: `INSERT INTO inventory_movements`.
5. Acreditación de puntos en ARBO Club: `INSERT INTO loyalty_transactions`.

### 2.2. Prevención de Cobro Duplicado: Idempotency Keys
Para evitar cobros duplicados por clics nerviosos del cajero o reintentos de red:
- Toda petición de cobro (`POST /api/orders/{id}/settle`) debe incluir el encabezado HTTP `Idempotency-Key: <UUID>`.
- El servidor almacena la clave en caché (Redis o tabla de claves con TTL de 24 horas). Si se recibe una petición idéntica, el servidor retorna la respuesta original almacenada sin volver a ejecutar la transacción.

---

## 3. MATRIZ DE RECUPERACIÓN ANTE FALLOS PARCIALES

| Componente que Falla | Comportamiento del Sistema | Estrategia de Recuperación / Resiliencia |
| :--- | :--- | :--- |
| **El Pago Digital Falla (Rechazo Tarjeta/MP)** | `ROLLBACK` total. La orden permanece en estado `PENDING` (no cobrada). | El cajero o cliente puede seleccionar otro medio de pago inmediatamente. |
| **La Caja del Turno está Cerrada** | `ROLLBACK` total. Error `409 Conflict: NO_OPEN_CASH_SHIFT`. | Obliga al cajero a realizar la apertura formal del turno antes de cobrar. |
| **El Proveedor Fiscal (AFIP) está Caído** | **NO se bloquea el cobro.** La transacción local se consolida (`COMMIT`). | Se emite comprobante provisorio de contingencia. Un worker en cola reintenta la obtención del CAE de forma asíncrona. |
| **El Servidor Realtime (WebSocket) está Caído** | La venta se confirma exitosamente en base de datos. | El KDS consulta por HTTP polling de respaldo en su próximo ciclo de 5 segundos. |
| **El Motor de ARBO Club está Inaccesible** | La venta se confirma. Se encola un evento de compensación. | El worker de fidelización reintenta la acreditación de puntos en background sin demorar al comensal. |

---

## 4. RESOLUCIÓN DEFINITIVA DE BUGS HISTÓRICOS DE ARBO

- **Resolución de BUG-003 (Cancelación en KDS):** La anulación de un ítem en el KDS ejecuta una mutación en base de datos que marca el `order_item` como `CANCELLED` y descuenta su valor del total de la orden en tiempo real, imposibilitando que el cajero cobre un plato anulado.
- **Resolución de BUG-004 (Ticket de KDS Huérfano):** Al confirmarse la transacción `SETTLED`, el trigger de base de datos actualiza automáticamente el estado de todos los tickets asociados en el KDS a `ARCHIVED` y emite el evento de cierre vía WebSockets.
