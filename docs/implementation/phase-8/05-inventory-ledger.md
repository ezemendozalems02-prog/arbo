# ARBO OS — Fase 8: Inventory Ledger (Única Fuente de Verdad)

### 1. Inmutabilidad Append-Only
`inventory_movements` se mantiene como la única fuente de verdad contable y física de ARBO OS.
En la Fase 8, se extiende de forma retrocompatible con la columna `warehouse_id UUID REFERENCES warehouses(id)`.

```sql
ALTER TABLE public.inventory_movements
ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
```

### 2. Tipos de Movimientos de Transferencia
- `TRANSFER_OUT`:
  - `quantity_delta`: Negativo (-Q).
  - `warehouse_id`: Depósito de origen.
  - `unit_cost_snapshot`: PPP vigente en el origen al momento de despacho.
  - `reference_id`: ID de la transferencia.
- `TRANSFER_IN`:
  - `quantity_delta`: Positivo (+Q recibido).
  - `warehouse_id`: Depósito de destino.
  - `unit_cost_snapshot`: Copiado inalterable del snapshot de despacho.
- `WASTE`:
  - `quantity_delta`: Negativo (-Q faltante).
  - `reason`: "Merma en transporte remito #{transfer_number}".
  - Imputado como merma de transporte sin alterar el historial físico de origen.
