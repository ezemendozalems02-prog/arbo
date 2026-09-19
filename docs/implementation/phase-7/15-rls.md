# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 15. POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS)

---

## 1. TABLAS CON RLS ACTIVADO
En la migración `20260919000007_fiscal_layer_automation.sql`, se activa RLS formal en:
1. `public.fiscal_invoices`
2. `public.fiscal_contingency_queue`
3. `public.automation_rules`
4. `public.automation_executions`

## 2. REGLAS DE ACCESO POR ROL Y TENANT
- **Usuarios Autenticados (Staff / Admin)**:
  - Pueden consultar comprobantes fiscales y reglas exclusivamente de su propia organización (`auth.jwt() -> 'app_metadata' ->> 'organization_id'`).
  - No pueden alterar ni borrar facturas emitidas (solo lectura o inserción de nuevos registros).
- **Cola de Contingencia**:
  - Estrictamente restringida a usuarios autenticados con rol administrativo o workers de backend autorizados.
  - El rol `anon` tiene acceso denegado (0 permisos).
- **Ejecuciones de Automatizaciones**:
  - Inmutables. Solo se permite `INSERT` y `SELECT` dentro del tenant.
