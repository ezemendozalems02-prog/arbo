# ARBO OS — FASE 2: VALIDACIÓN DE ROW LEVEL SECURITY (RLS)

---

## 1. POLÍTICAS RLS IMPLEMENTADAS

En la migración `20260919000002_catalog_recipes_inventory.sql`, las 6 tablas creadas tienen `ENABLE ROW LEVEL SECURITY`:

1. `categories`
2. `products`
3. `ingredients`
4. `recipes`
5. `recipe_items`
6. `inventory_movements`

### Modelo de Políticas PostgreSQL:
- **Lectura (`SELECT`):**
  Un usuario autenticado sólo puede visualizar registros pertenecientes a organizaciones donde posee membresía activa, verificado vía:
  ```sql
  organization_id IN (SELECT get_user_org_ids())
  ```
  En el caso de `recipe_items`, la relación se valida a través de la receta padre:
  ```sql
  EXISTS (
    SELECT 1 FROM recipes r
    WHERE r.id = recipe_items.recipe_id
    AND r.organization_id IN (SELECT get_user_org_ids())
  )
  ```
- **Escritura (`INSERT`, `UPDATE`, `DELETE`):**
  Solo los usuarios con rol `owner` o `admin` en la organización correspondiente pueden mutar catálogo, recetas e inventario, verificado vía:
  ```sql
  is_org_admin(organization_id)
  ```

---

## 2. PRUEBAS DE AISLAMIENTO MULTI-TENANT

El script de validación automatizada `scripts/validate_phase2_catalog_inventory.js` somete las reglas a una matriz de pruebas con dos tenants (`Org A` y `Org B`):

1. **Intento de Inyección de Ítem de Receta Cross-Tenant:**
   - Usuario de `Org B` intenta insertar un `recipe_item` apuntando a una receta de `Org A`.
   - **Resultado:** Rechazo estricto por RLS y constraint referencial.
2. **Filtrado Automático en Consultas:**
   - Al consultar `products`, `ingredients` y `inventory_movements`, un usuario con sesión en `Org A` recibe un conjunto de datos donde la cardinalidad de registros de `Org B` es exactamente 0.
3. **Imposibilidad de Mutación No Autorizada:**
   - Intentos de actualizar precios o costos de otra organización son bloqueados a nivel de motor de base de datos (`0 rows affected` o error de violación de RLS).

---

## 3. RESUMEN DE INTEGRIDAD

| Tabla | RLS Habilitado | Política de Lectura | Política de Escritura |
| :--- | :---: | :--- | :--- |
| `categories` | SÍ | `tenant_select_categories` | `tenant_admin_all_categories` |
| `products` | SÍ | `tenant_select_products` | `tenant_admin_all_products` |
| `ingredients` | SÍ | `tenant_select_ingredients` | `tenant_admin_all_ingredients` |
| `recipes` | SÍ | `tenant_select_recipes` | `tenant_admin_all_recipes` |
| `recipe_items` | SÍ | `tenant_select_recipe_items` | `tenant_admin_all_recipe_items` |
| `inventory_movements` | SÍ | `tenant_select_inv_movements` | `tenant_admin_all_inv_movements` |
