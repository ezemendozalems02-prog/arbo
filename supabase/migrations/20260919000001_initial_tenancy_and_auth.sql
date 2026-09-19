-- ARBO OS — MIGRATION 20260919000001: INITIAL TENANCY, AUTH & RLS
-- Version: 1.0.0
-- Description: Establishes base multi-tenancy (organizations, branches), user profiles, memberships and strict RLS.

-- 1. EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. FUNCIÓN DE ACTUALIZACIÓN AUTOMÁTICA DE UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ORGANIZACIONES (TENANT COMERCIAL MATRIZ)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50), -- CUIT en Argentina
    currency VARCHAR(10) DEFAULT 'ARS',
    timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TRIGGER tr_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. SUCURSALES (PUNTOS DE VENTA FÍSICOS)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL, -- ej. "PALERMO-01"
    address TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(organization_id, code)
);

CREATE TRIGGER tr_branches_updated_at
    BEFORE UPDATE ON public.branches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. PERFILES DE USUARIO (VINCULADOS A AUTH.USERS)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TRIGGER tr_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. TRIGGER DE SINCRONIZACIÓN AUTOMÁTICA ANTE REGISTRO EN SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, first_name, last_name, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. MEMBRESÍAS Y ROLES DE USUARIOS (MULTI-TENANT RBAC)
CREATE TABLE IF NOT EXISTS public.user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE, -- NULL si es Admin/Owner global
    role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN', 'ACCOUNTANT')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    UNIQUE(user_id, organization_id, branch_id)
);

CREATE TRIGGER tr_user_memberships_updated_at
    BEFORE UPDATE ON public.user_memberships
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. REGISTRO BASE DE AUDITORÍA
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- ej. "AUTH_LOGIN", "MEMBERSHIP_CREATED"
    description TEXT,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 9. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_branches_org_active ON public.branches(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_memberships_user_org ON public.user_memberships(user_id, organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_time ON public.audit_logs(organization_id, created_at DESC);

-- 10. FUNCIONES AUXILIARES PARA RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF UUID AS $$
    SELECT organization_id
    FROM public.user_memberships
    WHERE user_id = auth.uid() AND is_active = TRUE;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_memberships
        WHERE user_id = auth.uid()
          AND organization_id = org_id
          AND role IN ('OWNER', 'ADMIN')
          AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 11. ROW LEVEL SECURITY (RLS) POLICIES

-- Organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_policy" ON public.organizations
FOR SELECT USING (
    id IN (SELECT public.get_user_org_ids())
);

CREATE POLICY "org_update_policy" ON public.organizations
FOR UPDATE USING (
    public.is_org_admin(id)
);

-- Branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branches_select_policy" ON public.branches
FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids())
);

CREATE POLICY "branches_modify_policy" ON public.branches
FOR ALL USING (
    public.is_org_admin(organization_id)
);

-- User Profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own_policy" ON public.user_profiles
FOR ALL USING (
    id = auth.uid()
);

CREATE POLICY "profiles_org_read_policy" ON public.user_profiles
FOR SELECT USING (
    id IN (
        SELECT user_id FROM public.user_memberships
        WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
);

-- User Memberships
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "memberships_read_policy" ON public.user_memberships
FOR SELECT USING (
    user_id = auth.uid()
    OR
    public.is_org_admin(organization_id)
);

CREATE POLICY "memberships_admin_modify_policy" ON public.user_memberships
FOR ALL USING (
    public.is_org_admin(organization_id)
);

-- Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
FOR SELECT USING (
    public.is_org_admin(organization_id)
);

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
FOR INSERT WITH CHECK (
    organization_id IN (SELECT public.get_user_org_ids())
);
