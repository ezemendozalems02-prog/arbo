# FASE 1 — ARQUITECTURA DE AUTENTICACIÓN Y ROW LEVEL SECURITY (RLS)

---

## 1. PRINCIPIO DE AISLAMIENTO POR RLS

> **"Row Level Security (RLS) en PostgreSQL es la barrera de contención más confiable en arquitecturas multi-tenant. Aun si un atacante obtiene la clave pública `anon` y realiza peticiones directas vía cURL a la API de PostgREST, el motor de base de datos intercepta cada fila e impide leer o escribir datos de otra organización."**

---

## 2. FUNCIÓN AUXILIAR DE ACCESO TENANT

Para que las políticas RLS sean limpias, de alto rendimiento y reusables, se crea una función SQL indexada con permisos `SECURITY DEFINER`:

```sql
-- Retorna las organizaciones donde el usuario actual tiene una membresía activa
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM public.user_memberships
  WHERE user_id = auth.uid() AND is_active = TRUE;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## 3. POLÍTICAS RLS DETALLADAS POR TABLA

### 3.1. Políticas para `organizations`
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Un usuario solo puede ver las organizaciones a las que pertenece
CREATE POLICY "org_select_policy" ON organizations
FOR SELECT USING (
  id IN (SELECT public.get_user_org_ids())
);

-- Solo los roles OWNER o ADMIN de la organización pueden actualizar sus datos
CREATE POLICY "org_update_policy" ON organizations
FOR UPDATE USING (
  id IN (
    SELECT organization_id FROM public.user_memberships
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN') AND is_active = TRUE
  )
);
```

### 3.2. Políticas para `branches`
```sql
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Ver sucursales de su propia organización
CREATE POLICY "branches_select_policy" ON branches
FOR SELECT USING (
  organization_id IN (SELECT public.get_user_org_ids())
);

-- Crear / Modificar sucursales (solo OWNER / ADMIN)
CREATE POLICY "branches_modify_policy" ON branches
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.user_memberships
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN') AND is_active = TRUE
  )
);
```

### 3.3. Políticas para `user_profiles`
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario puede leer y editar su propio perfil
CREATE POLICY "user_profiles_own_policy" ON user_profiles
FOR ALL USING (
  id = auth.uid()
);

-- Los administradores de la misma organización pueden ver los perfiles de sus empleados
CREATE POLICY "user_profiles_org_view_policy" ON user_profiles
FOR SELECT USING (
  id IN (
    SELECT m.user_id FROM public.user_memberships m
    WHERE m.organization_id IN (SELECT public.get_user_org_ids())
  )
);
```

### 3.4. Políticas para `user_memberships`
```sql
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

-- Los usuarios ven sus propias membresías y los administradores ven las de su organización
CREATE POLICY "memberships_select_policy" ON user_memberships
FOR SELECT USING (
  user_id = auth.uid()
  OR
  organization_id IN (
    SELECT organization_id FROM public.user_memberships
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN') AND is_active = TRUE
  )
);

-- Solo OWNER y ADMIN pueden asignar o revocar roles en su organización
CREATE POLICY "memberships_admin_modify_policy" ON user_memberships
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.user_memberships
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN') AND is_active = TRUE
  )
);
```

### 3.5. Políticas para `audit_logs`
```sql
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Los audit logs solo pueden ser consultados por OWNER y ADMIN de la organización
CREATE POLICY "audit_logs_select_policy" ON audit_logs
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.user_memberships
    WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN') AND is_active = TRUE
  )
);

-- Inserción de logs permitida para cualquier usuario autenticado de la organización
CREATE POLICY "audit_logs_insert_policy" ON audit_logs
FOR INSERT WITH CHECK (
  organization_id IN (SELECT public.get_user_org_ids())
);
```

---

## 4. CICLO DE VIDA DE SESIÓN EN FRONTEND (SUPABASE AUTH)

```
[Usuario ingresa credenciales en /admin/login]
                       │
                       ▼
[supabase.auth.signInWithPassword({ email, password })]
                       │
                       ├─────────────────────────────────┐
                       ▼ Éxito                           ▼ Error
[Guarda JWT y Refresh Token en Storage Seguro]    [Muestra mensaje en rojo]
                       │
                       ▼
[Consulta get_user_org_ids() y perfil activo]
                       │
                       ▼
[Inyecta { user, org, branch, role } en AuthContext]
                       │
                       ▼
[ProtectedRoute autoriza renderizado de /admin/*]
```

- **Manejo de Sesión Expirada:** `supabase.auth.onAuthStateChange` escucha eventos `TOKEN_REFRESHED` y `SIGNED_OUT`. Si el refresh token es revocado, redirige de forma transparente al usuario a `/admin/login` limpiando el estado en memoria.
