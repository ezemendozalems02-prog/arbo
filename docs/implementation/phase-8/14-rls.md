# ARBO OS — Fase 8: Row Level Security (RLS)

### 1. Políticas RLS Implementadas
En la migración `20260919000008_multibranch_warehouses_transfers.sql`:

1. `warehouses`:
   - `SELECT`, `INSERT`, `UPDATE` filtran por `organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid`.
2. `stock_transfers`:
   - `SELECT`, `INSERT`, `UPDATE` filtran por `organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid`.
3. `stock_transfer_items`:
   - Valida pertenencia mediante cláusula `EXISTS (SELECT 1 FROM stock_transfers st WHERE st.id = transfer_id AND st.organization_id = auth_org)`.
4. `branch_product_settings`:
   - Política `ALL` restringida por `organization_id`.
