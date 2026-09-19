# ARBO OS — FASE 5: MÉTRICAS RFM & SEGMENTACIÓN DETERMINÍSTICA
## RECENCY, FREQUENCY & MONETARY VALUE

---

## 1. DEFINICIÓN DE DIMENSIONES RFM

El motor CRM de ARBO OS calcula el perfil de valor y comportamiento del cliente mediante tres variables determinísticas:

1. **Recency (Recencia)**:
   - Tiempo transcurrido (en días enteros) entre la fecha de referencia actual (`now`) y la marca temporal de la **última venta válida (`PAID`)** del cliente.
   - Fórmula: $\text{Recency (días)} = \lfloor (\text{now} - \text{last\_sale\_date}) / 86400000 \rfloor$.
2. **Frequency (Frecuencia)**:
   - Número total de compras válidas efectuadas por el cliente en cualquier sucursal de la organización.
   - Ventas canceladas o anuladas se excluyen estrictamente.
3. **Monetary (Valor Monetario)**:
   - Suma total de los importes finales facturados en las ventas válidas.
   - Permite calcular el **Ticket Promedio**: $\text{Ticket Promedio} = \text{Monetary} / \text{Frequency}$.

---

## 2. REGLAS DETERMINÍSTICAS DE SEGMENTACIÓN CRM

Para evitar puntuaciones arbitrarias o modelos de caja negra no auditables, ARBO OS clasifica a los clientes según reglas claras y objetivas:

| Segmento | Criterio de Activación | Interpretación Operativa |
| :--- | :--- | :--- |
| **`NO_PURCHASES`** | `Frequency == 0` | Cliente registrado pero sin compras concretadas |
| **`VIP_CHAMPION`** | `Frequency >= 5` AND `Monetary >= $20.000` AND `Recency <= 30d` | Cliente de máxima fidelidad y alto ticket |
| **`LOYAL_ACTIVE`** | `Frequency >= 3` AND `Recency <= 30d` | Cliente habitual con compra reciente |
| **`NEW_CUSTOMER`** | `Frequency == 1` AND `Recency <= 30d` | Cliente recién incorporado (oportunidad de bienvenida) |
| **`SLIPPING`** | `Recency > 30d` AND `Recency <= 60d` | Cliente en riesgo de abandono (requiere reactivación) |
| **`AT_RISK_INACTIVE`**| `Recency > 60d` | Cliente inactivo hace más de dos meses |
| **`OCCASIONAL`** | Resto de combinaciones | Cliente esporádico o de paso |

---

## 3. AUDITORÍA DE EXCLUSIÓN

- Las ventas con `status = 'CANCELLED'` o `status = 'REFUNDED'` **no suman** a la frecuencia ni al valor monetario.
- Las ventas anónimas (`customer_id IS NULL`) **no impactan** en ninguna métrica de cliente.
