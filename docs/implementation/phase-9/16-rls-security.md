# ARBO OS — FASE 9: RLS & SEGURIDAD MULTI-TENANT
## Políticas de Seguridad y Aislamiento en Base de Datos

### 1. Políticas RLS en Migración 009
En PostgreSQL (`supabase/migrations/20260919000009_intelligence_analytics_reports.sql`):
- `suppliers`: Políticas `suppliers_tenant_select`, `insert`, `update`, `delete` restringidas a `organization_id = auth.jwt() ->> 'organization_id'`.
- `purchase_suggestions`: Políticas de selección y gestión aisladas por tenant.
- `menu_engineering_snapshots`: Consultas históricas de ingeniería de menú protegidas por RLS.
- `ingredients`: Columnas adicionales (`primary_supplier_id`, `package_factor`, `target_stock_level`) bajo el RLS existente.

### 2. Validación Server-Side
Los servicios de dominio rechazan consultas que no contengan `organization_id` válido, impidiendo fugas de datos entre inquilinos (*cross-tenant leakage*).
