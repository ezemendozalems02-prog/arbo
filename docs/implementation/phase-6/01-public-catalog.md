# ARBO OS — FASE 6: PUBLIC CATALOG & PROYECCIÓN SEGURA
## ARQUITECTURA DEL CATÁLOGO PÚBLICO SANITIZADO

---

## 1. PRINCIPIO DE AISLAMIENTO INDUSTRIAL

El catálogo público de ARBO OS está diseñado bajo la premisa de **mínima exposición y confidencialidad comercial**. Ningún cliente web consumidor o bot de scraping puede acceder a la formulación de escandallos, costos de insumos, proveedores o márgenes brutos.

### Comparativa de Datos:
| Campo | Exposición Pública | Justificación |
| :--- | :---: | :--- |
| `id` | **SÍ** | Identificador unívoco del producto comercial |
| `name` | **SÍ** | Nombre visible en la carta (ej. "Espresso Doble") |
| `description` | **SÍ** | Notas de cata y descripción organoléptica |
| `base_price` | **SÍ** | Precio de venta al público en ARS |
| `image_url` | **SÍ** | Fotografía oficial del producto |
| `is_available` | **SÍ** | Disponibilidad operativa para venta online |
| `category_id / name` | **SÍ** | Agrupación visual en la carta digital |
| `current_cost_unit` | **NO** | Costo unitario de insumos (SECRETO COMERCIAL) |
| `PPP` | **NO** | Precio Promedio Ponderado contable |
| `Food Cost %` | **NO** | Margen industrial y financiero |
| `recipes / items` | **NO** | Gramajes y formulación de cocina/barra |
| `stock exacto` | **NO** | Stock numérico (evita deducción de ventas) |

---

## 2. PROYECCIÓN EN RPC Y DOMINIO

La función RPC `get_public_catalog(p_org_id, p_branch_id)` y el servicio de dominio `getPublicCatalog(state, ...)` aplican un filtro determinístico:
```sql
SELECT jsonb_agg(
    jsonb_build_object(
        'id', p.id,
        'category_id', p.category_id,
        'category_name', c.name,
        'name', p.name,
        'description', p.description,
        'base_price', p.base_price,
        'image_url', p.image_url,
        'is_available', p.is_available,
        'slug', p.slug
    )
)
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
WHERE p.organization_id = p_org_id
  AND p.is_active = TRUE
  AND p.is_available = TRUE;
```

Esto garantiza que las respuestas JSON entregadas al navegador sean livianas y 100% libres de información confidencial.
