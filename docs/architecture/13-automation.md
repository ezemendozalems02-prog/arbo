# 13 — MOTOR DE AUTOMATIZACIONES Y DISPARADORES DE ACCIÓN

---

## 1. EL PIPELINE DE AUTOMATIZACIÓN

El motor de automatización de ARBO OS procesa eventos de clientes y condiciones temporales para ejecutar acciones de marketing o soporte operativo sin intervención manual:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PIPELINE DE EJECUCIÓN DE AUTOMATIZACIÓN              │
├────────────────────────────────────────────────────────────────────────┤
│ 1. TRIGGER (Disparador)                                                │
│    - Basado en Eventos: order.settled, customer.created                │
│    - Basado en Tiempo (Cron): Diario a las 09:00 AM (ej. Cumpleaños)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. CONDITION (Evaluación de Reglas)                                    │
│    - Segmento de cliente (RFM)                                         │
│    - Días desde última visita > 45                                     │
│    - Saldo de puntos disponible >= 500                                 │
├────────────────────────────────────────────────────────────────────────┤
│ 3. IDEMPOTENCY CHECK (Filtro Anti-Spam)                                │
│    - ¿Ya se ejecutó esta regla para este cliente en esta ventana?      │
│    - Si ya se ejecutó -> DESCARTAR                                    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. ACTION (Ejecución de la Acción)                                     │
│    - Enviar mensaje WhatsApp con plantilla aprobada por Meta           │
│    - Acreditar cupón de descuento temporal en ARBO Club                │
│    - Generar alerta de reorden de compras para el encargado           │
├────────────────────────────────────────────────────────────────────────┤
│ 5. RESULT & AUDIT LOG                                                  │
│    - Registrar ejecución en tabla 'automation_executions'              │
│    - Emitir evento: 'automation.executed'                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CASOS DE USO PRINCIPALES

| Automatización | Disparador | Condición | Acción Ejecutada |
| :--- | :--- | :--- | :--- |
| **Cumpleaños del Comensal** | Cron diario (09:00 AM) | `fecha_nacimiento == hoy` | WhatsApp con saludo personalizado y cupón de 20% de descuento válido por 7 días. |
| **Reactivación de Clientes en Riesgo** | Cron semanal | `dias_sin_visita > 40` Y `visitas_historicas >= 3` | WhatsApp recordatorio con aviso de *"Te extrañamos, tenés 200 puntos esperándote"*. |
| **Bienvenida a ARBO Club** | Evento `customer.created` | Cliente recién registrado | WhatsApp con credencial virtual y 50 puntos de regalo inicial. |
| **Alerta de Insumo Crítico** | Evento `inventory.stock_low`| `stock_actual < stock_minimo` | Notificación interna en el panel de compras sugiriendo reorden al proveedor. |

---

## 3. IDEMPOTENCIA Y CONTROL DE FRECUENCIA (ANTI-SPAM)

Para evitar saturar a los comensales o enviar duplicados ante reintentos de workers:
1. **Clave de Idempotencia Compuesta:** Cada ejecución potencial genera un hash único:
   $$\text{ExecutionKey} = \text{MD5}(\text{rule\_id} + \text{customer\_id} + \text{period\_bucket})$$
   - Para cumpleaños, el `period_bucket` es el año actual (`2026`).
   - Para reactivación, el `period_bucket` es el mes actual (`2026-09`).
2. **Restricción de Base de Datos:**
   ```sql
   CREATE TABLE automation_executions (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       rule_id UUID NOT NULL,
       customer_id UUID NOT NULL,
       execution_key VARCHAR(64) NOT NULL UNIQUE,
       channel VARCHAR(30) NOT NULL, -- 'WHATSAPP', 'EMAIL'
       status VARCHAR(30) DEFAULT 'SENT',
       created_at TIMESTAMPTZ DEFAULT clock_timestamp()
   );
   ```
   Si el worker intenta procesar el mismo cliente dos veces, la restricción `UNIQUE(execution_key)` arroja una violación de unicidad controlada y el envío se cancela limpiamente.
