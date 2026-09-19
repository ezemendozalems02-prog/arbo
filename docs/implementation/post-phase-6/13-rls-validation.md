# ARBO OS — POST-PHASE 6 CHECKPOINT
## 13. AUDITORÍA DE ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS

---

## 1. REVISIÓN DE POLÍTICAS POR ROL (ANON vs AUTHENTICATED vs SERVER)

Se revisó el estado de RLS sobre la totalidad del catálogo de tablas del sistema:

| Tabla | RLS Habilitado | Acceso Anónimo (`anon`) | Acceso Autenticado (`authenticated`) |
| :--- | :---: | :--- | :--- |
| `organizations` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `branches` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `categories` | **SÍ** | Ninguno (Vía RPC sanitizado) | Filtrado por `get_user_org_ids()` |
| `products` | **SÍ** | Ninguno (Vía RPC sanitizado) | Filtrado por `get_user_org_ids()` |
| `ingredients` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `recipes` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `recipe_items` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `inventory_movements` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `cash_registers` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `cash_sessions` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `cash_movements` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `sales` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `sale_items` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `payments` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `kitchen_stations` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `kitchen_tickets` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `customers` | **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `loyalty_transactions`| **SÍ** | Ninguno (0 filas) | Filtrado por `get_user_org_ids()` |
| `public_orders` | **SÍ** | SELECT por `public_token` / INSERT | SELECT / INSERT / UPDATE por tenant |
| `public_order_items` | **SÍ** | SELECT por orden / INSERT | SELECT / INSERT por tenant |

---

## 2. RESULTADO DE SEGURIDAD

Ninguna tabla operativa ni contable expone datos a usuarios no autorizados. Las operaciones anónimas permitidas se limitan estrictamente a la inserción de pedidos y consulta del tracking de su propio token.
