# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 13. DISPONIBILIDAD Y PRECIOS POR SUCURSAL (BRANCH OVERRIDES)

---

## 1. CONTROL DE DISPONIBILIDAD LOCAL
Aunque un producto exista en el catálogo maestro corporativo:
- Si en la sucursal de Esquel no hay stock de leche de almendras, el producto debe poder pausarse en Esquel sin pausarse en Trevelin.
- Mecanismo: Tabla de sobreescrituras operativas `branch_product_settings`:
  - `id`: UUID PRIMARY KEY
  - `organization_id`: UUID NOT NULL REFERENCES organizations(id)
  - `branch_id`: UUID NOT NULL REFERENCES branches(id)
  - `product_id`: UUID NOT NULL REFERENCES products(id)
  - `is_available`: BOOLEAN NOT NULL DEFAULT TRUE
  - `price_override`: NUMERIC(12, 2) NULLABLE (si difiere del base_price corporativo)
  - Restricción: `UNIQUE(branch_id, product_id)`

---

## 2. POLÍTICA DE PRECIOS UNIFICADA VS LOCAL (DECISION REQUIRED)
> [!WARNING]
> ### DECISION REQUIRED: Política de Precios de Cadena
> - **Opción A (Recomendada para ARBO Patagonia)**: Precios centralizados uniformes en toda la red de locales para proteger la coherencia de marca. Los overrides solo se autorizan con permiso expreso de Gerencia Corporativa.
> - **Opción B**: Libertad total de precios por sucursal para adaptar a costos logísticos locales.
