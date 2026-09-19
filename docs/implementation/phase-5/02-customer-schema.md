# ARBO OS — FASE 5: ESQUEMA DE CLIENTES & IDENTIDAD
## MODELO DE DATOS Y TENANCY ORGANIZATION-LEVEL

---

## 1. PRINCIPIO DE DISEÑO: CLIENTE A NIVEL ORGANIZACIÓN

En ARBO OS, el cliente **pertenece a la Organización (`organization_id`)**, no exclusivamente a una sucursal específica (`branch_id`).

### Justificación de Negocio y Arquitectura
- **Experiencia de Marca Unificada**: Si un cliente se registra en la sucursal Trevelin Centro (`Branch A`), al visitar la sucursal Trevelin Estación (`Branch B`) o Esquel Express (`Branch C`), su cuenta, saldo de puntos ARBO Club y preferencias están inmediatamente disponibles.
- **Relación con Ventas**: Mientras que el cliente es *Organization-Level*, cada venta (`sales`) es *Branch-Level*, permitiendo discriminar la facturación y el inventario por local sin fragmentar la identidad del consumidor.

---

## 2. ESQUEMA DDL DE LA TABLA `customers`

```sql
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL,
    email TEXT,
    document_id TEXT,
    birthdate DATE,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MERGED', 'BLOCKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_customers_org_phone UNIQUE (organization_id, phone)
);
```

---

## 3. IDENTIDAD DE BAJA FRICCIÓN: `phone`

- **Canal Primario**: En gastronomía de especialidad y fast-casual, solicitar un email al momento de pagar en caja genera fricción inadmisible. El número de teléfono celular actúa como identificador principal.
- **Normalización**: Se implementa la función `normalizePhone(phone)` que elimina espacios, guiones y paréntesis, preservando el código de país (ej. `+5493410000000`), evitando duplicados accidentales por tipeo.
- **Aislamiento Multi-Tenant**: La restricción de unicidad es `UNIQUE(organization_id, phone)`. El mismo teléfono puede existir en la Organización A y en la Organización B sin conflicto, garantizando aislamiento total entre negocios independientes.

---

## 4. RELACIÓN CON `sales` (COMPATIBILIDAD CON VENTAS ANÓNIMAS)

Se agregó la columna `customer_id` a la tabla `sales`:

```sql
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
```

- **Opcionalidad**: `customer_id` admite valores `NULL`. El POS permite operar transacciones rápidas de mostrador sin registrar cliente.
- **Preservación Histórica**: Todas las ventas históricas de Fases 1 a 4 permanecen plenamente válidas con `customer_id = NULL`.
