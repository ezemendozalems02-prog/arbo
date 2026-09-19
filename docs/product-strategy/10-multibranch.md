# 10 — ESTRATEGIA MULTI-SUCURSAL: ARQUITECTURA DÍA 1 vs FEATURES POSTERIORES

---

## 1. LA LECCIÓN FORENSE DE FUDO: EL PECADO ORIGINAL DE ARQUITECTURA

En la auditoría comparativa (`docs/research/fudo-vs-arbo/07-scale-multibranch-franchise.md`) se descubrió que Fudo implementó las sucursales como **cuentas completamente aisladas**:
- Cada sucursal es un tenant separado en base de datos.
- No existen transferencias formales de stock entre locales; el usuario debe simularlas haciendo un egreso manual en el local de origen y un ingreso manual en el de destino (`[FACT]`).
- Los clientes y puntos no se comparten nativamente entre sucursales de una misma marca.
- La consolidación de reportes requiere exportaciones de planillas o interfaces suplementarias lentas.

> **"La capacidad multi-sucursal no puede agregarse como un parche sobre un esquema mono-sucursal sin tener que reescribir toda la base de datos más adelante. Debe ser un REQUISITO ARQUITECTÓNICO DESDE EL DÍA 1, aunque las FEATURES operativas de gestión multi-local se desbloqueen progresivamente en V1 y V2."**

---

## 2. TAXONOMÍA: ARQUITECTURA DÍA 1 vs FEATURES POSTERIORES

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DIVISIÓN ESTRATÉGICA MULTI-SUCURSAL                  │
├──────────────────────────────────┬─────────────────────────────────────┤
│ 1. REQUISITO ARQUITECTÓNICO      │ 2. FEATURES POSTERIORES             │
│    (Día 1 - Obligatorio en BD)   │    (V1 / Fase 2 - A demanda)        │
├──────────────────────────────────┼─────────────────────────────────────┤
│ - Modelado Tenant / Org / Branch │ - Transferencias formales de stock  │
│ - Claves foráneas en cada tabla  │ - Reportes consolidados ejecutivos  │
│ - Aislamiento RLS en base datos  │ - Centro de producción compartido   │
│ - Permisos y roles por sucursal  │ - Precios diferenciados por zona    │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 3. REQUISITOS ARQUITECTÓNICOS DESDE EL DÍA 1 (BASE DE DATOS)

Aunque el MVP solo se comercialice para locales individuales, el esquema de datos debe nacer preparado para multi-tenancy jerárquico:

### 3.1. Modelo Jerárquico de Tres Niveles
1. `organizations`: Representa la entidad legal o marca comercial matriz (ej. "Café Arbo SRL").
2. `branches`: Representa cada punto de venta físico o dark kitchen (ej. "Sucursal Palermo", "Sucursal Belgrano").
3. `warehouses` (Depósitos): Cada sucursal tiene al menos un depósito principal, pero una organización puede tener un "Depósito Central / Centro de Producción".

### 3.2. Claves Foráneas Obligatorias en Todas las Entidades
Toda tabla transaccional debe incluir sin excepción:
- `organization_id UUID NOT NULL`
- `branch_id UUID NULL` (o NOT NULL según aplique):
  - Entidades globales a nivel organización: `products`, `recipes`, `customers`, `loyalty_tiers`.
  - Entidades locales a nivel sucursal: `orders`, `cash_shifts`, `cash_movements`, `tables`, `kds_tickets`, `stock_levels`.

### 3.3. Seguridad a Nivel de Filas (Row Level Security - RLS)
- Un cajero o mozo asignado a la "Sucursal Palermo" solo tiene permisos de lectura/escritura sobre los registros con `branch_id = Palermo`.
- El dueño o gerente general con rol `org_admin` tiene acceso transparente a todas las sucursales de su `organization_id`.

---

## 4. FEATURES POSTERIORES (V1 Y FASE ESCALA)

Las pantallas y flujos de trabajo multi-sucursal que se activarán una vez consolidado el MVP:

### 4.1. Transferencias Formales de Stock (Remitos Internos)
- Documento transaccional de despacho: reduce el stock del Depósito Central y lo pone en estado `EN_TRANSITO`.
- Documento de recepción en sucursal destino: confirma cantidades recibidas, registra mermas de traslado y suma al stock local.

### 4.2. Catálogo Centralizado con Sobreescritura Local
- Menú e ingredientes definidos por la casa matriz.
- Flexibilidad para que la sucursal de aeropuerto o zona turística aplique un recargo de precio (+15%) o deshabilite platos que no prepara.

### 4.3. Fidelización Cross-Branch (ARBO Club Global)
- El comensal acumula puntos consumiendo en la Sucursal 1 y puede redimirlos indistintamente en la Sucursal 2 (`[FACT: src/services/loyaltyPointsService.js modela el cliente a nivel cuenta general]`).

### 4.4. Panel Directivo Consolidado (Owner Dashboard)
- Visualización en tiempo real de ventas brutas, ticket promedio y Food Cost comparativo entre todas las sucursales en una sola pantalla.

---

## 5. IMPACTO DE ESTA DECISIÓN EN EL DESARROLLO

- **Evita la deuda técnica:** Permite arrancar el MVP operando en un solo local (`branch_id = default`), pero con el 100% de las consultas SQL y modelos ya vinculados a `branch_id`.
- **Cero fricción de migración:** Cuando el cliente abra su segunda sucursal, no requerirá migraciones traumáticas de datos ni duplicación de cuentas como en Fudo.
