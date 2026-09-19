# ARBO OS — Fase 8: Modelo de Depósitos (Warehouses)

### 1. Definición Relacional
Cada depósito físico pertenece jerárquicamente a una organización y a una sucursal específica:
`organization_id -> branch_id -> warehouse_id`

```sql
CREATE TABLE public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    warehouse_type VARCHAR(30) NOT NULL DEFAULT 'BRANCH' CHECK (
        warehouse_type IN ('CENTRAL', 'BRANCH', 'BAR', 'KITCHEN')
    ),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_warehouses_branch_code UNIQUE (branch_id, code)
);
```

### 2. Restricciones e Integridad
- **Unicidad de Código por Sucursal**: `UNIQUE (branch_id, code)`. No pueden existir dos depósitos con el mismo código dentro de una sucursal.
- **Aislamiento Multi-Tenant**: Las políticas de RLS garantizan que los depósitos de la Organización A nunca sean visibles para la Organización B.
- **Tipos de Depósito**:
  - `CENTRAL`: Almacén primario / Centro de distribución / Tostaduría.
  - `BRANCH`: Almacén general de sucursal.
  - `BAR` / `KITCHEN`: Sub-depósitos operativos para despacho directo.
