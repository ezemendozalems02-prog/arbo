# ARBO OS — FASE 5: PRIVACIDAD & PROTECCIÓN DE PII
## GESTIÓN DE INFORMACIÓN PERSONAL IDENTIFICABLE EN CUSTOMERS

---

## 1. PRINCIPIOS DE PRIVACIDAD

La entidad `customers` maneja datos sensibles (Personally Identifiable Information - PII): nombre, teléfono, correo electrónico, fecha de nacimiento y documento de identidad.

### Políticas Implementadas:
1. **Minimización de Datos**: Únicamente se solicita el nombre y teléfono para la operación estándar de caja. Documento y email son opcionales.
2. **Aislamiento Multi-Tenant Estricto**: La información de los clientes de una organización es totalmente inaccesible para los usuarios de cualquier otra organización mediante políticas de Row Level Security (RLS).
3. **No Exposición en Logs**: Las funciones del sistema y scripts de auditoría nunca imprimen PII en logs de consola de producción sin sanitización.
4. **Sin APIs Externas No Autorizadas**: No se envían datos de clientes a proveedores de mensajería (ej. WhatsApp API o Meta) en esta fase.

---

## 2. POLÍTICAS RLS EN BASE DE DATOS

Todas las tablas que contienen datos de clientes y fidelización tienen RLS habilitado:

```sql
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
```

Las políticas aplican `organization_id IN (SELECT public.get_user_org_ids())`, bloqueando cualquier intento de consulta directa a través de la API de Supabase o PostgREST por parte de usuarios ajenos a la organización.
