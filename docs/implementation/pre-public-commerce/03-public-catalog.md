# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 03. PREPARACIÓN DEL CATÁLOGO PÚBLICO (PUBLIC CATALOG READINESS)

---

## 1. SEPARACIÓN ESTRICTA: PUBLIC vs INTERNAL PRODUCT DATA

Para servir el catálogo en la web pública (menú digital, carta online, pedidos para llevar y delivery), el modelo de datos debe proyectar una vista limpia disociada de la capa industrial de escandallos.

### Campos Públicos Permitidos (`PublicProductDTO`):
- `id` (UUID del producto)
- `category_id` (UUID de la categoría pública)
- `name` (Nombre comercial, ej. "Espresso Doble")
- `description` (Descripción organoléptica orientada al cliente)
- `base_price` (Precio de venta al público en ARS)
- `image_url` (URL pública de fotografía)
- `is_available` (Booleano indicando si está en stock para venta online)
- `display_order` (Orden en la carta digital)
- `tags` / `allergens` (Etiquetas comerciales, ej. "Vegano", "Sin TACC", "Especialidad")

### Campos Internos Prohibidos en la API Pública:
- `current_cost_unit`
- `PPP` (Precio Promedio Ponderado)
- `food_cost_percentage`
- `recipe_id` y componentes de recetas
- `quantity_delta` de insumos
- `stock exacto` (e.g. "quedan 4.982 kg de café"): la web sólo debe ver `Disponible` o `Agotado`.

---

## 2. ESTRUCTURA REQUERIDA PARA FASE 6

Para que Fase 6 pueda operar con máximo rendimiento y sin brechas de seguridad, se documenta la necesidad de una función RPC de catálogo público o vista sanitizada:

```sql
-- Concepto arquitectónico para Fase 6 (READ-ONLY, NO IMPLEMENTAR EN ESTE CHECKPOINT)
CREATE OR REPLACE FUNCTION public.get_public_catalog(p_branch_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
...
-- Resuelve organization_id y branch_id desde el slug validado
-- Proyecta únicamente categorías y productos activos
-- Omite recetas, ingredientes y costos
$$;
```

Esto garantiza que ningún cliente frontend pueda hacer scraping de los costos operativos o la estructura de recetas de la empresa.
