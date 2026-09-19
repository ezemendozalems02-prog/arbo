# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 02. AUDITORÍA DEL MODELO MULTI-TENANT Y SUCURSALES ACTUAL

---

## 1. MODELO RELACIONAL EXISTENTE (`branches`)
La tabla `public.branches` establecida en la migración `20260919000001` y extendida en fases posteriores contiene:
- `id` UUID PRIMARY KEY
- `organization_id` UUID NOT NULL REFERENCES organizations(id)
- `name` VARCHAR(255) NOT NULL
- `code` VARCHAR(50) NOT NULL (ej. 'TRV-01', 'ESQ-01')
- `address` TEXT
- `phone` VARCHAR(50)
- `is_active` BOOLEAN DEFAULT TRUE
- `slug` VARCHAR(100) (Agregado en Fase 6 para resolución pública web)
- `fiscal_pos_number` INT DEFAULT 1 (Agregado en Fase 7 para AFIP WSFE)
- `created_at`, `updated_at`
- Restricción: `UNIQUE(organization_id, code)` y `UNIQUE(organization_id, slug)`.

---

## 2. RELACIÓN USUARIO - ORGANIZACIÓN - SUCURSAL (`user_memberships`)
- `user_memberships` ya contempla asignación flexible:
  - `branch_id UUID REFERENCES branches(id) ON DELETE CASCADE`
  - Si `branch_id IS NULL`, el usuario es considerado de alcance corporativo global (`OWNER`, `ADMIN`, `ACCOUNTANT`).
  - Si `branch_id IS NOT NULL`, el usuario está acotado operacionalmente a esa sucursal (`MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`).

---

## 3. LO QUE FALTA PARA FASE 8 EN SUCURSALES
Actualmente, todas las sucursales son homogéneas ("puntos de venta de salón"). Falta diferenciar:
1. **Tipo de Sucursal**: Diferenciar locales de atención al público de centros de producción/tostaduría que no atienden mostrador pero concentran stock primario.
2. Atributos de configuración operativa: depósito principal por defecto para depletions automáticas de venta.
