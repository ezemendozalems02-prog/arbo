# ARBO OS — POST-PHASE 6 CHECKPOINT
## 17. MATRIZ DE RIESGOS CONOCIDOS & CONSIDERACIONES PRE-FASE 7

---

## 1. ESTADO DE RIESGOS POST-FASE 6

| Riesgo | Nivel | Mitigación Implementada | Estado |
| :--- | :---: | :--- | :---: |
| **Inconsistencia de Ventas Online vs Salón** | P0 | Ambas comparten el motor `executeSaleCheckoutAtomic` | **RESUELTO** |
| **Stock Negativo por Concurrencia** | P0 | Validación de saldo de insumos en tiempo de checkout | **RESUELTO** |
| **Falsificación de Precios en Cliente** | P0 | Recálculo forzoso desde `products.base_price` | **RESUELTO** |
| **Ataques IDOR en Tracking** | P1 | Token criptográfico aleatorio >24 caracteres | **RESUELTO** |
| **Duplicación de Puntos en Fidelización** | P1 | Restricción única sobre `(sale_id, transaction_type)` | **RESUELTO** |
| **P0 Blockers Activos** | - | Ninguno | **0 ACTIVOS** |
| **P1 Risks Activos** | - | Ninguno | **0 ACTIVOS** |

---

## 2. LÍMITES DEL SCOPE ACTUAL PARA FASES POSTERIORES

Para futuras fases de desarrollo (Fase 7+), quedan identificados como requerimientos evolutivos:
1. **Gateways de Pago Online**: Integración de webhooks asíncronos para Mercado Pago / Stripe con idempotencia de callback.
2. **Delivery Avanzado**: Ruteo con geolocalización y despacho a repartidores externos.
3. **Fiscalidad AFIP / ARCA**: Emisión de comprobantes fiscales electrónicos (Facturas A, B, C) en el momento del cobro.
4. **Marketing Automation & WhatsApp API**: Envíos transaccionales directos por mensajería al avanzar las comandas.
