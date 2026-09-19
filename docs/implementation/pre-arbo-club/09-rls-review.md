# ARBO OS — PRE-ARBO CLUB CHECKPOINT: REVISIÓN INTEGRAL DE SEGURIDAD Y RLS

---

## 1. ESTADO DE RLS EN LA TOTALIDAD DE TABLAS EXISTENTES

Se auditó el 100% de las tablas implementadas a través de las 4 migraciones versionadas:

| # | Tabla | Migración | RLS | Modelo de Seguridad Multi-Tenant |
| :---: | :--- | :---: | :---: | :--- |
| 1 | `organizations` | 1 | ✅ | `id IN (SELECT get_user_org_ids())` |
| 2 | `branches` | 1 | ✅ | `organization_id IN (SELECT get_user_org_ids())` |
| 3 | `user_profiles` | 1 | ✅ | Propio usuario o miembros de la misma org |
| 4 | `user_memberships`| 1 | ✅ | Propio usuario o admin de la org |
| 5 | `audit_logs` | 1 | ✅ | Admin de la org |
| 6 | `categories` | 2 | ✅ | Miembros de la org |
| 7 | `products` | 2 | ✅ | Miembros de la org |
| 8 | `ingredients` | 2 | ✅ | Miembros de la org |
| 9 | `recipes` | 2 | ✅ | Miembros de la org |
| 10 | `recipe_items` | 2 | ✅ | Vía receta padre de la org |
| 11 | `inventory_movements`| 2 | ✅ | Miembros de la org |
| 12 | `cash_registers` | 3 | ✅ | Miembros de la org |
| 13 | `cash_sessions` | 3 | ✅ | Miembros de la org |
| 14 | `cash_movements` | 3 | ✅ | Miembros de la org |
| 15 | `sales` | 3 | ✅ | Miembros de la org |
| 16 | `sale_items` | 3 | ✅ | Vía venta padre de la org |
| 17 | `payments` | 3 | ✅ | Miembros de la org |
| 18 | `kitchen_stations`| 4 | ✅ | Miembros de la org |
| 19 | `kitchen_tickets` | 4 | ✅ | Miembros de la org |
| 20 | `kitchen_ticket_items`| 4 | ✅ | Vía comanda padre de la org |

---

## 2. VECTORES DE FUGA O VULNERABILIDADES CROSS-TENANT

- **Bypass Directo:** Imposible sin credenciales válidas del tenant.
- **Acceso Anónimo:** Retorna 0 registros en todas las tablas comerciales, de caja, inventario y cocina.
- **Simulación IDOR (Insecure Direct Object Reference):** Validada en el test suite `scripts/validate_rls_isolation.js` (5/5 PASADOS).
