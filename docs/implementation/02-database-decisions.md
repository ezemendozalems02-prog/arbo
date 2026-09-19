# FASE 1 — DECISIONES DE BASE DE DATOS Y ESQUEMA RELACIONAL

---

### METADATOS
- **Documento:** `docs/implementation/02-database-decisions.md`
- **Fase:** Fase 1 — Persistencia, Auth & RLS
- **Fecha:** 19 de Septiembre de 2026
- **Motor:** PostgreSQL 16+ (Supabase)

---

## 1. ESQUEMA DDL DE LA FASE 1

El esquema de la Fase 1 establece la estructura jerárquica de tenencia y perfiles de usuario. Todas las tablas se crean dentro del esquema público `public` de PostgreSQL con extensiones estándar `pgcrypto` / `gen_random_uuid()`.

```sql
-- 1. EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ORGANIZACIONES (TENANT COMERCIAL)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50), -- CUIT en Argentina
    currency VARCHAR(10) DEFAULT 'ARS',
    timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 3. SUCURSALES (PUNTOS DE VENTA FÍSICOS)
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL, -- ej. "PALERMO-01"
    address TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(organization_id, code)
);

-- 4. PERFILES DE USUARIOS (VINCULADOS A SUPABASE AUTH)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 5. MEMBRESÍAS Y ROLES DE USUARIOS (MULTI-TENANT RBAC)
CREATE TABLE user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE, -- NULL si es Admin/Owner global de la organización
    role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN', 'ACCOUNTANT')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(user_id, organization_id, branch_id)
);

-- 6. REGISTRO BASE DE AUDITORÍA DE SEGURIDAD Y EVENTOS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- ej. "AUTH_LOGIN", "MEMBERSHIP_CREATED"
    description TEXT,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);
```

---

## 2. JUSTIFICACIÓN DE DECISIONES TÉCNICAS

### 2.1. Identificadores UUID v4 (`gen_random_uuid()`)
- **Por qué:** Los identificadores autoincrementales (`SERIAL` / enteros 1, 2, 3...) exponen el volumen de ventas y clientes a ataques de enumeración. Los UUIDs permiten generar identificadores de forma distribuida en el cliente u offline sin colisiones.

### 2.2. Precisión Temporal: `TIMESTAMPTZ` con `clock_timestamp()`
- **Por qué:** `now()` retorna la hora de inicio de la transacción en PostgreSQL, lo que produce marcas de tiempo idénticas para múltiples inserciones en el mismo bloque. `clock_timestamp()` entrega el microsegundo real exacto de la ejecución de cada sentencia, garantizando ordenación estricta en registros de auditoría y ledgers.

### 2.3. Sincronización Automática de Usuarios: Trigger `on_auth_user_created`
- Para evitar que la creación de un usuario en Supabase Auth (`auth.users`) quede desfasada de la tabla de perfiles de la aplicación (`user_profiles`), se implementa una función con trigger automático:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. ESTRATEGIA DE ÍNDICES DE RENDIMIENTO

Para garantizar que la verificación de pertenencia y permisos en cada consulta SQL tome menos de 2 milisegundos:
```sql
CREATE INDEX idx_user_memberships_lookup ON user_memberships(user_id, organization_id, is_active);
CREATE INDEX idx_branches_org ON branches(organization_id, is_active);
CREATE INDEX idx_audit_logs_org_date ON audit_logs(organization_id, created_at DESC);
```
