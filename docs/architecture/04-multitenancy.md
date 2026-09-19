# 04 — MODELO MULTI-TENANT Y MULTI-SUCURSAL JERÁRQUICO

---

## 1. JERARQUÍA DE AISLAMIENTO MULTI-TENANT

Para evitar las limitaciones estructurales observadas en competidores como Fudo, ARBO OS implementa un modelo jerárquico de tres niveles:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ORGANIZATION (Tenant Legal / Comercial)              │
│                 Ejemplo: "Café de Especialidad Arbo SRL"               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 1 : N
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  BRANCHES (Sucursales Físicas / Canales)               │
│          Ejemplos: "Sucursal Palermo", "Sucursal Belgrano"             │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │ 1 : N                         │ 1 : N
                    ▼                               ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│        WAREHOUSES (Depósitos)        │ │    OPERATIONAL ENTITIES       │
│  - Depósito Barra                    │ │  - Mesas / Salón              │
│  - Depósito Cocina                   │ │  - Cajas de Turno             │
│  - Depósito Central (Cross-Branch)   │ │  - Pantallas KDS              │
└──────────────────────────────────────┘ └───────────────────────────────┘
```

---

## 2. TAXONOMÍA DE ENTIDADES: GLOBALES vs SUCURSAL

| Ámbito | Entidades Incluidas | Clave de Aislamiento | Justificación de Negocio |
| :--- | :--- | :--- | :--- |
| **Global (Organización)** | `products`, `categories`, `recipes`, `sub_recipes`, `ingredients`, `customers`, `loyalty_tiers`, `suppliers` | `organization_id UUID NOT NULL` | Un café o plato tiene la misma receta base e ingredientes en toda la marca. El cliente de ARBO Club es reconocido en cualquier local. |
| **Local (Sucursal)** | `orders`, `order_items`, `cash_shifts`, `cash_movements`, `tables`, `kds_tickets`, `inventory_levels`, `stock_transfers` | `organization_id UUID NOT NULL`<br>`branch_id UUID NOT NULL` | Las ventas, el dinero en caja y las mesas pertenecen estrictamente a la operación física de un local específico. |

---

## 3. AISLAMIENTO A NIVEL DE BASE DE DATOS (ROW LEVEL SECURITY - RLS)

La seguridad de datos no confía en filtros del frontend ni en cláusulas `WHERE` manuales en el código del servidor; se garantiza a nivel del motor PostgreSQL mediante **Row Level Security (RLS)** activado en el 100% de las tablas.

### 3.1. Inyección de Contexto en la Sesión JWT
Cuando un usuario se autentica en Supabase Auth, el token JWT emitido contiene en su payload los claims validados:
```json
{
  "sub": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "email": "cajero@cafearbo.com",
  "app_metadata": {
    "org_id": "org_a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "branch_id": "br_11223344-5566-7788-99aa-bbccddeeff00",
    "role": "CASHIER"
  }
}
```

### 3.2. Políticas RLS para Tablas Globales de la Organización
```sql
-- Ejemplo: Tabla 'products'
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_products_select" ON products
FOR SELECT USING (
  organization_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid
);

CREATE POLICY "tenant_isolation_products_modify" ON products
FOR ALL USING (
  organization_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid
  AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'OWNER', 'MANAGER')
);
```

### 3.3. Políticas RLS para Tablas Locales de Sucursal
```sql
-- Ejemplo: Tabla 'orders'
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branch_isolation_orders_select" ON orders
FOR SELECT USING (
  organization_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid
  AND (
    -- El administrador de la organización ve todas las sucursales
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'OWNER')
    OR
    -- El empleado solo ve las órdenes de su sucursal asignada
    branch_id = (auth.jwt() -> 'app_metadata' ->> 'branch_id')::uuid
  )
);
```

---

## 4. CONTROL DE ACCESO BASADO EN ROLES (RBAC)

Se definen 7 roles de usuario con privilegios acotados por el principio de menor privilegio:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MATRIZ DE ROLES (RBAC)                          │
├─────────────┬───────────────────┬──────────────────────┬───────────────┤
│ ROL         │ ÁMBITO DE ACCESO  │ PERMISOS PRINCIPALES │ RESTRICCIONES │
├─────────────┼───────────────────┼──────────────────────┼───────────────┤
│ OWNER       │ Todas las sucurs. │ Control total, P&L   │ Ninguna       │
│ ADMIN       │ Todas las sucurs. │ Configuración, altas │ Sin billing   │
│ MANAGER     │ Sucursal propia   │ Compras, caja, stock │ Sin ver P&L   │
│ CASHIER     │ Sucursal propia   │ POS, cobro, arqueo   │ Sin editar rec│
│ WAITER      │ Sucursal propia   │ Mesas, comanda salón │ Sin ver caja  │
│ KITCHEN     │ Sucursal propia   │ KDS, marcar platos   │ Solo pantalla │
│ ACCOUNTANT  │ Solo lectura Org  │ Reportes, fiscal     │ Sin operar    │
└─────────────┴───────────────────┴──────────────────────┴───────────────┘
```

---

## 5. PROTECCIÓN CONTRA REFERENCIAS DIRECTAS INSEGURAS (IDOR)

Para evitar ataques donde un usuario autenticado intente acceder a un recurso de otro restaurante modificando el UUID en la URL (ej. `GET /api/orders/order_xyz`):
1. **Verificación en Capa SQL:** La política RLS evalúa la condición `organization_id = auth_org_id` antes de retornar cualquier registro. Si el ID existe pero pertenece a otro tenant, la base de datos retorna `404 Not Found` (no `403 Forbidden`), impidiendo la enumeración de identificadores.
2. **Validación en Capa de Servicio:** Toda mutación o comando exige que el payload coincida con el tenant verificado del token de sesión.
