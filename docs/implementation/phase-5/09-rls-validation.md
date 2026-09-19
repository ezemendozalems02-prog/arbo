# ARBO OS — FASE 5: VALIDACIÓN DE ROW LEVEL SECURITY (RLS)
## PRUEBAS DE AISLAMIENTO MULTI-TENANT EN CLIENTES Y FIDELIZACIÓN

---

## 1. MATRIZ DE AISLAMIENTO EVALUADA

Se validó el aislamiento cruzado entre dos organizaciones distintas (`Org A: ARBO Trevelin` y `Org B: Rival Café`):

| Escenario | Tenant Solicitante | Objeto Destino | Tenant Propietario | Resultado Esperado | Resultado Obtenido |
| :--- | :---: | :--- | :---: | :---: | :---: |
| Lectura de Cliente | Org A | `Customer Demo` | Org A | Permitido | **PASS** |
| Lectura Cross-Tenant | Org A | `Cliente Rival` | Org B | Oculto (0 filas) | **PASS** |
| Modificación Cross-Tenant | Org A | `Cliente Rival` | Org B | Bloqueado / Error | **PASS** |
| Ledger Cross-Tenant | Org A | Transacciones Org B | Org B | Oculto (0 filas) | **PASS** |
| Recompensas Cross-Tenant | Org A | Catálogo Org B | Org B | Oculto (0 filas) | **PASS** |
| Teléfono Idéntico Multi-Tenant | Org B | Mismo teléfono que Org A | Org B | Permitido sin colisión | **PASS** |

---

## 2. POLÍTICAS RLS VERSIONADAS

Las siguientes políticas quedaron aplicadas en `20260919000005_arbo_club_crm.sql`:

1. `tenant_customers_select` y `tenant_customers_manage`:
   - `organization_id IN (SELECT public.get_user_org_ids())`.
2. `tenant_loyalty_tx_select` y `tenant_loyalty_tx_insert`:
   - `organization_id IN (SELECT public.get_user_org_ids())`.
3. `tenant_rewards_select` y `tenant_rewards_manage`:
   - `organization_id IN (SELECT public.get_user_org_ids())`.
4. `tenant_redemptions_select` y `tenant_redemptions_manage`:
   - `organization_id IN (SELECT public.get_user_org_ids())`.

Todas las aserciones de aislamiento fueron validadas y superadas al 100% en la suite de pruebas.
