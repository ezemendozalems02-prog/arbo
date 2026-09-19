# ARBO OS — Fase 8: Sobreescrituras por Sucursal (Branch Overrides)

### 1. Tabla `branch_product_settings`
Permite adaptar el catálogo global a la realidad física de cada sucursal:

```sql
CREATE TABLE public.branch_product_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    price_override NUMERIC(12, 2) CHECK (price_override IS NULL OR price_override >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_branch_product_settings UNIQUE (branch_id, product_id)
);
```

### 2. Comportamiento en Resolución
- Si no existe registro en `branch_product_settings`:
  - `is_available` = `product.is_available`
  - `effective_price` = `product.base_price`
- Si existe registro:
  - `is_available` = `branch_product_settings.is_available`
  - `effective_price` = `branch_product_settings.price_override ?? product.base_price`
