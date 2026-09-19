# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 11. AUDITORÍA DE SEGURIDAD ESPECÍFICA DE PUBLIC COMMERCE

---

## 1. MATRIZ DE AMENAZAS & VULNERABILIDADES IDENTIFICADAS

Al exponer endpoints a Internet abierto, se presentan vectores de ataque que no existían en el entorno operativo cerrado de las Fases 1 a 5:

| Vector de Ataque | Descripción | Severidad | Mitigación Requerida para Fase 6 |
| :--- | :--- | :---: | :--- |
| **Price Tampering** | El atacante intercepta el payload y envía `base_price: 1` | **CRÍTICA** | El backend recalcula el precio exclusivamente desde `products.base_price` |
| **Order IDOR** | Un usuario cambia el ID en la URL de tracking `/orden/:id` para ver datos de otros | **ALTA** | Proteger tracking con token secreto de orden (`tracking_token` o HMAC) |
| **Tenant Escape** | Enviar `productId` de Org A dentro de un pedido dirigido a Org B | **ALTA** | Validación en DB de que todos los productos pertenecen a la misma `organization_id` |
| **Exposición de PII** | Consultar historial de un cliente con sólo su número de teléfono | **ALTA** | El endpoint de tracking sólo expone estado del pedido, no historial completo |
| **Replay Attacks** | Reenvío múltiple de un webhook de pago aprobado | **MEDIA** | Validación de idempotencia con `UNIQUE(external_payment_id)` |
| **DoS por Pedidos Falsos**| Inundación de pedidos en efectivo no retirados | **MEDIA** | Límites de pedidos concurrentes por IP/teléfono y captchas si aplica |
| **Fuga de Costos/Recetas**| Consulta abierta a tablas `products` o `recipes` vía Supabase REST | **CRÍTICA** | Mantener RLS estricto y exponer catálogo únicamente mediante RPC sanitizado |

---

## 2. EVALUACIÓN DE LAS POLÍTICAS RLS ACTUALES

- Las políticas actuales de Fase 1 a Fase 5 bloquean por defecto cualquier acceso anónimo (`anon`) a las tablas sensibles (`customers`, `sales`, `cash_sessions`, `inventory_movements`, `kitchen_tickets`).
- **Recomendación**: En Fase 6 **NO** se debe abrir la tabla `sales` a usuarios anónimos mediante políticas permisivas. La tabla `public_orders` debe ser la única que permita `INSERT` anónimo con validaciones en triggers/RPCs, y la creación de la venta real debe seguir siendo ejecutada por funciones `SECURITY DEFINER` de confianza.
