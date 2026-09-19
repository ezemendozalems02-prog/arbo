# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 10. POLÍTICAS DE ROW LEVEL SECURITY (RLS) PARA LA CAPA FISCAL

---

## 1. ESQUEMA DE PERMISOS POR ROL

Las entidades fiscales manejan información tributaria y fiscal sensible de la empresa:

```
┌────────────────────────────────────────────────────────┐
│             MATRIZ DE ACCESO FISCAL (RLS)              │
├──────────────────────┬─────────────┬───────────────────┤
│ Entidad              │ Rol: anon   │ Rol: authenticated│
├──────────────────────┼─────────────┼───────────────────┤
│ fiscal_invoices      │ DENEGADO    │ SELECT (Tenant)   │
│                      │             │ INSERT (Vía RPC)  │
├──────────────────────┼─────────────┼───────────────────┤
│ fiscal_contingency_q │ DENEGADO    │ SELECT (Tenant)   │
│                      │             │ UPDATE (Admin)    │
├──────────────────────┼─────────────┼───────────────────┤
│ automation_rules     │ DENEGADO    │ SELECT / UPDATE   │
│                      │             │ (Tenant Admin)    │
├──────────────────────┼─────────────┼───────────────────┤
│ automation_executions│ DENEGADO    │ SELECT (Tenant)   │
└──────────────────────┴─────────────┴───────────────────┘
```

---

## 2. POLÍTICAS DETERMINÍSTICAS PREVISTAS

1. **`fiscal_invoices_tenant_select`**:
   - `USING (organization_id IN (SELECT public.get_user_org_ids()))`
2. **`fiscal_invoices_tenant_insert`**:
   - Las mutaciones directas mediante el cliente de Supabase estarán deshabilitadas (`WITH CHECK (false)`). La inserción se realizará exclusivamente a través de la función de emisión autorizada (`SECURITY DEFINER`).
3. **Consulta Pública de Comprobante por el Cliente**:
   - El cliente que compró online sólo podrá consultar su comprobante mediante el `public_token` de su orden en `public_orders`, sin acceso a las facturas del resto del negocio.
