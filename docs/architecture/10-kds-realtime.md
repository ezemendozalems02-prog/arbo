# 10 — KDS Y ARQUITECTURA REALTIME DE COCINA

---

## 1. FLUJO DE VIDA DE LA COMANDA EN COCINA

La pantalla de cocina KDS (Kitchen Display System) opera como una vista reactiva del estado transaccional de las comandas en preparación:

```
[Comanda Generada en Salón / POS / Web]
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│             ROUTING POR ESTACIÓN EN SERVIDOR           │
│        (Separación automática: Cocina vs Barra)        │
└──────────────────┬───────────────────┬─────────────────┘
                   │                   │
                   ▼                   ▼
     ┌───────────────────────┐   ┌───────────────────────┐
     │ KDS ESTACIÓN: COCINA  │   │  KDS ESTACIÓN: BARRA  │
     │  - Hamburguesas       │   │  - Tragos             │
     │  - Guarniciones       │   │  - Cafés de especial. │
     └─────────────┬─────────┘   └───────────┬───────────┘
                   │                         │
                   ▼                         ▼
┌────────────────────────────────────────────────────────┐
│                 MÁQUINA DE ESTADOS DEL TICKET          │
│ PENDING ──► PREPARING ──► READY ──► DELIVERED ──► ARCH.│
└────────────────────────────────────────────────────────┘
```

---

## 2. CANALES Y PROTOCOLO REALTIME

### 2.1. Suscripción por Tópico de Sucursal
- **Canal WebSocket:** `realtime:kds:{branch_id}:{station_id}`
- **Eventos Transmitidos:**
  - `ticket.created`: Nueva comanda inyectada en cocina. Dispara alerta sonora.
  - `item.status_changed`: Actualización de plato individual (ej. "En preparación" -> "Listo").
  - `ticket.cancelled`: Anulación o modificación de comanda desde el POS.
  - `order.settled`: Notificación de cobro que archiva el ticket completado.

### 2.2. Aislamiento y Desacoplamiento de Terminales
> **"El estado de la cocina NUNCA debe depender de que una tablet o pantalla específica permanezca encendida."**

- Todo el estado reside en las tablas `orders` y `order_items` de PostgreSQL.
- Si una tablet de cocina se queda sin batería, se apaga o se reinicia, al volver a abrir la URL carga instantáneamente el estado exacto de las comandas activas mediante una consulta SQL indexada (`WHERE branch_id = $1 AND status != 'ARCHIVED'`).

---

## 3. RESILIENCIA Y RECUPERACIÓN ANTE CORTES DE CONEXIÓN

```
┌────────────────────────────────────────────────────────────────────────┐
│                 MECANISMO DE HEARTBEAT Y FALLBACK                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. HEARTBEAT ACTIVO: Ping cada 10 segundos servidor <-> cliente.       │
│ 2. DETECCIÓN DE CORTE: Si se pierden 2 pings consecutivos (20s):       │
│    - La UI del KDS muestra un badge rojo: "MODO RECONEXIÓN ACTIVO".    │
│    - Se activa inmediatamente un POLLING HTTP de respaldo cada 5s.     │
│ 3. RECONEXIÓN TRANSPARENTE: Al restablecerse el socket WebSocket:      │
│    - Se desactiva el polling HTTP.                                     │
│    - Se sincronizan los deltas perdidos mediante timestamp.            │
│    - El badge vuelve a verde: "EN LÍNEA".                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. PREVENCIÓN DE DUPLICADOS E IDEMPOTENCIA

Para evitar que una comanda aparezca duplicada por reenvíos de red:
1. Cada comanda posee un `daily_ticket_number` secuencial único por sucursal y día (ej. `#042`).
2. El cliente KDS mantiene un set en memoria de `ticket_id` procesados; ante un evento duplicado, lo descarta silenciosamente si el timestamp no es más reciente que el estado actual.
