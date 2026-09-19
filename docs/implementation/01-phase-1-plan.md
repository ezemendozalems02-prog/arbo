# FASE 1 — PLAN DE IMPLEMENTACIÓN: PERSISTENCIA, AUTH & RLS
## Documentación Previa a la Modificación de Código

---

### METADATOS
- **Fase:** Fase 1 — Persistencia, Supabase Auth, RLS y Tenancy Base
- **Documento:** `docs/implementation/01-phase-1-plan.md`
- **Fecha:** 19 de Septiembre de 2026
- **Estado:** PLAN TÉCNICO APROBADO
- **Fuentes Vinculantes:**
  - `docs/architecture/IMPLEMENTATION-GATE.md`
  - `docs/architecture/FINAL-ARBO-OS-ARCHITECTURE-REVIEW.md`
  - `docs/product-strategy/FINAL-ARBO-OS-PRODUCT-STRATEGY.md`
  - `docs/research/arbo-os/FINAL-ARBO-OS-FORENSIC-AUDIT.md`

---

## 1. OBJETIVO ESTRICTO DE LA FASE 1

Construir los cimientos reales de persistencia y seguridad de ARBO OS:
1. Establecer la conexión cliente/servidor con **Supabase** mediante `@supabase/supabase-js`.
2. Implementar **Supabase Auth** real (login, logout, persistencia de sesión en cookies/localStorage seguro, y manejo de sesión expirada).
3. Blindar el acceso a `/admin` mediante un **Route Guard** que redirija usuarios no autenticados a una pantalla de login ergonómica acorde al diseño de ARBO.
4. Crear la estructura relacional multi-tenant básica en PostgreSQL:
   $$\text{organizations} \longrightarrow \text{branches} \longrightarrow \text{user\_profiles} \longrightarrow \text{user\_memberships}$$
5. Activar **Row Level Security (RLS)** en el 100% de las tablas creadas, garantizando que un usuario solo pueda consultar y modificar datos de su organización/sucursal.
6. Establecer la tabla base de auditoría (`audit_logs`) para registrar eventos de acceso y cambios de tenancy.
7. Ejecutar una prueba empírica de seguridad demostrando que el aislamiento RLS rechaza accesos cruzados entre organizaciones.

---

## 2. INVENTARIO DEL ESTADO ACTUAL DEL REPOSITORIO

### 2.1. Qué Existe Actualmente
- **Framework & Build:** React 19.2.4 + Vite 8.0.4 + Tailwind CSS v4.2.2 + Framer Motion 12.38.0 + React Router DOM 7.14.0.
- **Frontend SPA:** Sistema completo de pantallas públicas (`src/pages/`: Carta, Pedidos, Reservas, Club) y administrativas (`src/admin/pages/`: Dashboard, POS, Mesas, Caja, KDS, Inventario, CRM, Loyalty, Marketing, Analítica).
- **Servicios de Dominio:** 22 archivos en `src/services/` con cálculos matemáticos puros (PPP, recetas, caja, KDS, segmentación).
- **Mock Data:** 25 archivos en `src/mock/` que alimentan el prototipo.
- **Contextos en Memoria:** `POSContext`, `InventoryContext`, `CRMContext` persistiendo en `localStorage`.

### 2.2. Qué Falta
- Conexión configurada con Supabase (`@supabase/supabase-js` no instalado en `package.json`).
- Variables de entorno (`.env` / `.env.example`).
- Migraciones SQL versionadas.
- Tablas relacionales en base de datos (`organizations`, `branches`, `user_profiles`, `user_memberships`, `audit_logs`).
- Políticas RLS a nivel de motor PostgreSQL.
- Pantalla de Login y protección de rutas en `/admin`.
- Contexto de autenticación (`AuthContext`) que provea usuario, tenant y rol activo.

### 2.3. Qué se Reutiliza
- Sistema de diseño completo: Tailwind CSS v4, paleta cálida de hospitalidad (`src/styles/theme.js`), tipografía y micro-animaciones.
- Estructura de navegación y layouts (`AdminLayout`, `AdminSidebar`, `nav.config.js`).
- Servicios puros de cálculo matemático (`src/services/`).
- Catálogo de productos y recetas de `src/mock/` para generar el script semilla (`seed.sql`).

### 2.4. Qué se Reemplaza
- Acceso directo y público a `/admin`: ahora interceptado por `ProtectedRoute`.
- Identidad mock hardcodeada (`"Admin"` o `"Cajero"`): sustituida por el perfil autenticado de Supabase Auth.
- Guardado de credenciales o estados de sesión en variables sueltas: reemplazado por la sesión criptográfica JWT de Supabase.

### 2.5. Qué Queda Temporalmente Intacto (Para Evitar Regresiones)
- `POSContext`, `InventoryContext`, `CRMContext`: continúan proveyendo los datos efímeros a las pantallas de operación diaria durante la Fase 1, permitiendo que la UI siga funcionando mientras se valida la capa de Auth y Tenancy. Se migrarán a TanStack Query en las Fases 2 y 3.
- Pantallas públicas de comensales (`/carta`, `/pedidos`, `/reservas`): permanecen accesibles sin login, exactamente como lo exige la arquitectura.

---

## 3. PLAN TÉCNICO DE EJECUCIÓN (PASO A PASO)

```
PASO 1: Instalación de Dependencia & Configuración de Entorno
  - Instalar '@supabase/supabase-js' en package.json.
  - Crear '.env.example' y cliente centralizado 'src/lib/supabase.js'.
       ↓
PASO 2: Diseño y Creación de Migraciones SQL
  - 'supabase/migrations/20260919000001_initial_tenancy_and_auth.sql'
  - Tablas: organizations, branches, user_profiles, user_memberships, audit_logs.
  - Triggers: 'on_auth_user_created' para sincronizar usuarios de Supabase Auth.
  - Políticas RLS estrictas para aislamiento multi-tenant.
       ↓
PASO 3: Implementación de la Capa de Autenticación en Frontend
  - Crear 'src/context/AuthContext.jsx' (login, logout, session listener, currentOrg, currentBranch, role).
  - Crear 'src/admin/components/ProtectedRoute.jsx'.
  - Crear pantalla de login 'src/admin/pages/auth/Login.jsx' con estética ARBO.
  - Añadir control de usuario y botón de cerrar sesión en 'AdminSidebar.jsx'.
  - Proteger la ruta '/admin/*' en 'src/App.jsx'.
       ↓
PASO 4: Generación de Semilla (Seed) de Prueba
  - 'supabase/seed.sql': Creación de Organización A ("Café Arbo Palermo") y Organización B ("Burger Arbo Belgrano") con usuarios y sucursales.
       ↓
PASO 5: Validación Empírica de Seguridad & RLS
  - Ejecutar script de verificación de aislamiento multi-tenant:
    Comprobar que User A no puede leer ni mutar registros de Organization B.
       ↓
PASO 6: Documentación & Cierre de Fase
  - Elaborar reportes '02-database-decisions.md' a 'FINAL-PHASE-1-REPORT.md'.
  - Validar build ('npm run build') y typecheck.
```

---

## 4. CRITERIOS DE ACEPTACIÓN INNEGOCIABLES

- [ ] `@supabase/supabase-js` instalado e inicializado sin exponer claves `service_role` en frontend.
- [ ] Migraciones SQL versionadas y reproducibles.
- [ ] Tablas creadas con RLS activo en PostgreSQL.
- [ ] Route Guard bloqueando el acceso a `/admin` para usuarios anónimos.
- [ ] Pantalla de Login funcional y estilizada.
- [ ] Logout funcional y persistencia de sesión ante refresco de pantalla.
- [ ] Demostración empírica de aislamiento RLS: Usuario de Org A rechazado al intentar leer Org B.
- [ ] Cero regresiones en la compilación de producción (`npm run build` exitoso).
