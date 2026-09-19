# ARBO OS — FASE 10: ENDURECIMIENTO PARA PRODUCCIÓN (PRODUCTION HARDENING)
## Seguridad y Mitigación de Vulnerabilidades

### 1. Variables de Entorno y Secretos
- Ninguna clave privada de administración (`SUPABASE_SERVICE_ROLE_KEY`) está presente en el código frontend de la aplicación.
- El cliente Supabase utiliza exclusivamente la clave pública anónima (`VITE_SUPABASE_ANON_KEY`), garantizando que todas las lecturas y escrituras dependan estrictamente de las políticas RLS evaluadas en el servidor PostgreSQL.

### 2. Prevención de Cross-Tenant Leakage
- Toda llamada analítica, fiscal o de stock valida la pertenencia al `organization_id` de la sesión del usuario.
- Cabeceras de seguridad CSP y HTTPS forzado en el entorno de despliegue de producción.
