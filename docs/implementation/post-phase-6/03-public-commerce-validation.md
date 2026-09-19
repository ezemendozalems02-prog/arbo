# ARBO OS — POST-PHASE 6 CHECKPOINT
## 03. VALIDACIÓN DEL CATÁLOGO PÚBLICO & ENRUTAMIENTO MULTI-TENANT

---

## 1. BLINDAJE DE DATOS EN `getPublicCatalog`

Se comprobó que la proyección pública del catálogo implementada en `publicCommerceManager.js` y en la RPC `public.get_public_catalog(...)`:
1. **Excluye estrictamente información industrial**:
   - `current_cost_unit`: No expuesto.
   - `PPP` (Precio Promedio Ponderado): No expuesto.
   - `Food Cost %`: No expuesto.
   - `recipes` y `recipe_items`: No expuestos.
   - `suppliers`: No expuestos.
   - `inventory_movements` y stock numérico exacto: No expuestos.
2. **Expone únicamente atributos comerciales**:
   - `id`, `category_id`, `category_name`, `name`, `description`, `base_price`, `image_url`, `is_available`, `slug`.

---

## 2. ENRUTAMIENTO MULTI-TENANT POR SLUG

Se verificó el comportamiento de `resolveBranchBySlug(state, slug)`:
- `Tenant A` (slug: `trevelin`) resuelve exclusivamente la sucursal de Trevelin de la Organización A.
- Un usuario en `Tenant A` no puede solicitar productos de `Tenant B` (el intento de mezclar IDs dispara la excepción `TENANT_ESCAPE_DETECTED`).
- La URL pública jamás acepta un `organization_id` directo o arbitrario desde el navegador, garantizando aislamiento multi-tenant por diseño.
