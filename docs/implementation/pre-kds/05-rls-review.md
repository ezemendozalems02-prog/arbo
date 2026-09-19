# ARBO OS — PRE-KDS TECHNICAL CHECKPOINT: REVISIÓN DE SEGURIDAD Y RLS

---

## 1. COBERTURA DE ROW LEVEL SECURITY (RLS)

Se verificó el estado de RLS en el 100% de las tablas del esquema en las 3 migraciones:

| Tabla | Migración | RLS Activo | Política de Lectura (SELECT) | Política de Mutación (INSERT/UPDATE/DELETE) |
| :--- | :---: | :---: | :--- | :--- |
| `organizations` | 1 | SÍ | `id IN (SELECT get_user_org_ids())` | `is_org_admin(id)` |
| `branches` | 1 | SÍ | `organization_id IN (SELECT get_user_org_ids())` | `is_org_admin(organization_id)` |
| `user_profiles` | 1 | SÍ | Propio `auth.uid()` o miembros de la misma org | Propio `auth.uid()` |
| `user_memberships` | 1 | SÍ | Propio `auth.uid()` o admin de la org | `is_org_admin(organization_id)` |
| `audit_logs` | 1 | SÍ | `is_org_admin(organization_id)` | Miembros de la org |
| `categories` | 2 | SÍ | Miembros de la org | `is_org_admin(organization_id)` |
| `products` | 2 | SÍ | Miembros de la org | `is_org_admin(organization_id)` |
| `ingredients` | 2 | SÍ | Miembros de la org | `is_org_admin(organization_id)` |
| `recipes` | 2 | SÍ | Miembros de la org | `is_org_admin(organization_id)` |
| `recipe_items` | 2 | SÍ | Vía receta padre de la org | Vía receta padre (Admin org) |
| `inventory_movements`| 2 | SÍ | Miembros de la org | Miembros de la org (Append-only) |
| `cash_registers` | 3 | SÍ | Miembros de la org | `is_org_admin(organization_id)` |
| `cash_sessions` | 3 | SÍ | Miembros de la org | Miembros de la org |
| `cash_movements` | 3 | SÍ | Miembros de la org | Miembros de la org (Append-only) |
| `sales` | 3 | SÍ | Miembros de la org | Miembros de la org (Admin para update) |
| `sale_items` | 3 | SÍ | Vía venta padre de la org | Vía venta padre de la org |
| `payments` | 3 | SÍ | Miembros de la org | Miembros de la org |

---

## 2. ANÁLISIS DE VECTORES DE FUGA O ACCESO CROSS-TENANT

Se inspeccionaron posibles vectores de ataque o bypass de aislamiento:
1. **Acceso Anónimo:**
   - Todo usuario no autenticado obtiene un conjunto vacío en todas las tablas comerciales y de stock.
2. **Inyección Cross-Tenant:**
   - Intentar insertar un `sale_item` o `recipe_item` apuntando a una cabecera de otra organización es bloqueado tanto por RLS como por el boundary transaccional.
3. **Roles RBAC:**
   - Las operaciones de configuración (categorías, productos, precios, recetas) exigen rol `OWNER` o `ADMIN` verificado vía `public.is_org_admin()`.

**Conclusión de RLS:** El aislamiento multi-tenant en PostgreSQL es robusto, coherente e impenetrable sin credenciales autorizadas del tenant correspondiente.
