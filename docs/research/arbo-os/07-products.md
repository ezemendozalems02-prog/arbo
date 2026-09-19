# 07 — Productos, categorías y catálogo

**Estado general:** `NOT_IMPLEMENTED` como módulo administrable.
El catálogo **existe y se usa**, pero es de **sólo lectura**: no hay ABM.

## 7.1 Los tres módulos del grupo "Catálogo" no existen

`nav.config.js:40-47` declara el grupo Catálogo con tres entradas, las tres
con `available: false`:

| Ruta | Label | Estado |
|---|---|---|
| `/admin/productos` | Productos | `NOT_IMPLEMENTED` → pantalla "Próximamente" |
| `/admin/categorias` | Categorías | `NOT_IMPLEMENTED` → pantalla "Próximamente" |
| `/admin/modificadores` | Modificadores | `NOT_IMPLEMENTED` → pantalla "Próximamente" |

Verificado en el barrido de rutas: las tres aparecen en el sidebar con el
badge "PRONTO" y renderizan `ComingSoon.jsx`.

## 7.2 Qué sí existe

`src/mock/products.js` deriva el catálogo de `src/data/menu.js` — la misma
fuente que alimenta la carta pública. Es una decisión de diseño acertada:
una sola carta para el sitio y para el POS, sin duplicación.

- **35 productos**, **12 categorías** (café, desayunos, meriendas, pastelería,
  almuerzos, sándwiches, picadas, platos, vinos, bebidas, postres).
- Cada producto lleva: `id`, `name`, `description`, `price`, `cat`, `img`,
  `orderable`, más dos campos que agrega la capa POS: `modifierGroups` y
  `station`.
- `CATEGORIES` se deriva de `MENU_CATEGORIES` agregando `active: true` — un
  valor constante: no hay forma de desactivar una categoría.

## 7.3 Capacidades — inventario honesto

| Capacidad | Estado |
|---|---|
| Listar productos (en el POS) | `CONFIRMED_WORKING` |
| Filtrar por categoría (en el POS) | `CONFIRMED_WORKING` |
| **Crear producto** | `NOT_IMPLEMENTED` |
| **Editar producto** | `NOT_IMPLEMENTED` |
| **Eliminar / archivar producto** | `NOT_IMPLEMENTED` |
| **Cambiar precio** | `NOT_IMPLEMENTED` — requiere editar `src/data/menu.js` y redesplegar |
| **Gestionar categorías** | `NOT_IMPLEMENTED` |
| **Activar / desactivar producto** | `NOT_IMPLEMENTED` |
| **Disponibilidad (agotado hoy)** | `NOT_IMPLEMENTED` |
| **Impuestos por producto** | `NOT_IMPLEMENTED` — el IVA sólo existe a nivel de compra (`taxRate: 21`) |
| **Imagen** | `PARTIAL` — el campo existe y se usa en el sitio público; no es editable |
| **Combos** | `NOT_IMPLEMENTED` |
| **Variantes** (talle/tamaño) | `NOT_IMPLEMENTED` — se aproximan con modificadores |
| **Modificadores** | ver `09-modifiers.md` — existen, no son administrables |
| **Receta asociada** | `PARTIAL` — ver `08-recipes-costs.md`; se vincula por `recipe.productId` |

## 7.4 Consecuencia operativa

**INFERENCE · P1 para el negocio.** Cambiar el precio de un café requiere
editar código fuente y volver a desplegar. En un rubro donde los precios se
ajustan con frecuencia, esto convierte una tarea diaria del dueño en una tarea
de desarrollo. Es, junto con la ausencia de backend, la brecha que más limita
que ARBO OS pueda operar un local real.

## 7.5 Inconsistencias producto ↔ receta ↔ stock ↔ venta

- **producto ↔ receta:** 14 de 35 productos tienen receta (`recipe.productId`).
  Los 21 restantes no tienen costo calculable: en `/admin/costos` aparecen sin
  food cost. No es un bug — es cobertura parcial de la semilla.
- **receta ↔ stock:** correcto y verificado. Ver `08-recipes-costs.md`.
- **producto ↔ venta:** correcto: la venta guarda `productId`, `name` y
  `unitPrice` **congelados** en la línea. Un cambio de precio posterior no
  reescribe ventas históricas. Decisión correcta.
- **venta ↔ stock:** **roto por diseño.** La venta no descuenta insumos.
  Ver `10-stock.md`.
