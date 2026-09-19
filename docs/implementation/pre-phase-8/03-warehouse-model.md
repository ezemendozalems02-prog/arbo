# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 03. MODELO CONCEPTUAL DE DEPÓSITOS (`warehouses`)

---

## 1. RELACIÓN ESTRUCTURAL ÓPTIMA
Se analizan las dos opciones de arquitectura para depósitos:

### Opción A: `organization -> branch -> warehouse`
- Todo depósito debe pertenecer obligatoriamente a una sucursal física.
- El "Depósito Central" se modela como una sucursal de tipo centro logístico/producción.
- Ventaja: Coherencia absoluta con las políticas RLS y con `inventory_movements(branch_id)`.

### Opción B: `organization -> warehouse (branch_id nullable)`
- Los depósitos centrales no pertenecen a ninguna sucursal y son corporativos.
- Desventaja: Obliga a permitir `branch_id NULL` en `inventory_movements`, rompiendo consultas y funciones SQL preexistentes como `get_current_stock(p_org_id, p_branch_id, p_ingredient_id)`.

### DECISIÓN DE ARQUITECTURA:
Adoptar la **Opción A enriquecida**:
Cada depósito se vincula a una sucursal (`branch_id NOT NULL REFERENCES branches(id)`). Si la organización posee un "Depósito Central de Tostaduría", este se registra como una sucursal operativa propia (ej. `code: 'TRV-CENTRAL'`, `name: 'Centro Logístico & Tostaduría'`), garantizando que **NUNCA** se rompa la integridad foránea de `branch_id`.

---

## 2. ATRIBUTOS DEL MODELO DE DEPÓSITOS
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `organization_id`: UUID NOT NULL REFERENCES organizations(id)
- `branch_id`: UUID NOT NULL REFERENCES branches(id)
- `name`: VARCHAR(100) NOT NULL (ej. "Depósito Principal", "Barra Salón", "Cámara Fría")
- `code`: VARCHAR(50) NOT NULL (ej. "DEP-BARRA-01")
- `warehouse_type`: VARCHAR(30) NOT NULL CHECK (warehouse_type IN ('CENTRAL', 'STORE_MAIN', 'BAR', 'KITCHEN'))
- `is_default`: BOOLEAN NOT NULL DEFAULT FALSE (Depósito que descuenta ventas por defecto)
- `is_active`: BOOLEAN NOT NULL DEFAULT TRUE
- `created_at`, `updated_at`: TIMESTAMPTZ
- Restricción: `UNIQUE(branch_id, code)`
