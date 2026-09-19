# ARBO OS — FASE 3: VALIDACIÓN DE ROW LEVEL SECURITY (RLS)

---

## 1. POLÍTICAS RLS EN TABLAS DE FASE 3

En la migración `20260919000003_sales_cash_acid.sql`, las 6 tablas creadas tienen `ENABLE ROW LEVEL SECURITY`:

1. `cash_registers`
2. `cash_sessions`
3. `cash_movements`
4. `sales`
5. `sale_items`
6. `payments`

### Reglas de Aislamiento:
- **Lectura (`SELECT`):**
  Un usuario únicamente puede leer registros pertenecientes a sus organizaciones activas:
  ```sql
  organization_id IN (SELECT public.get_user_org_ids())
  ```
  Para `sale_items`:
  ```sql
  sale_id IN (
    SELECT id FROM public.sales
    WHERE organization_id IN (SELECT public.get_user_org_ids())
  )
  ```
- **Escritura (`INSERT`, `UPDATE`):**
  Solo usuarios con permisos de administración o membresía en la organización pueden generar ventas, sesiones de caja y pagos.
  Los movimientos de caja e inventario son append-only (no admiten `UPDATE` ni `DELETE`).

---

## 2. PRUEBA DE AISLAMIENTO CROSS-TENANT

Se sometió a prueba el límite transaccional intentando ejecutar una venta desde un usuario de `Organization B` contra una caja perteneciente a `Organization A`:
- **Resultado:** Rechazado a nivel de boundary transaccional con `CASH_SESSION_NOT_OPEN: La caja no pertenece a la organización`.
- Un usuario de Tenant B no puede ver ventas ni saldos de Tenant A.
