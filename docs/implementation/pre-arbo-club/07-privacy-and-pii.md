# ARBO OS — PRE-ARBO CLUB CHECKPOINT: PRIVACIDAD Y DATOS PII

---

## 1. IDENTIFICACIÓN DE DATOS SENSIBLES (PII)

El módulo de ARBO Club y CRM incorporará datos personales regulados (Ley 25.326 de Protección de Datos Personales en Argentina / RGPD):
- Nombre y Apellido
- Teléfono celular / WhatsApp
- Correo electrónico
- DNI / CUIT
- Historial financiero individual y patrones de consumo

---

## 2. REGLAS DE ACCESO Y MITIGACIÓN DE RIESGOS

1. **Aislamiento Multi-Tenant por RLS:**
   - Ningún usuario de `Organization A` podrá ver ni consultar clientes de `Organization B`.
   - Las consultas a `customers` requerirán obligatoriamente:
     `organization_id IN (SELECT get_user_org_ids())`.
2. **Segregación por Rol (RBAC):**
   - **Mozos / Cajeros:** En mostrador y salón solo se expone el nombre de pila, tier de fidelidad y saldo de puntos para agilizar el servicio. El teléfono y DNI se enmascaran parcialmente (ej. `+54 9 11 ****-5678`).
   - **Administradores / Gerentes:** Acceso al perfil completo para resolución de disputas o campañas autorizadas.
3. **Registro de Auditoría:**
   - La modificación manual de saldos o datos de clientes quedará asentada con `actor_id` y `ip_address` en `public.audit_logs`.
