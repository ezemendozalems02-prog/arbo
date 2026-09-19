# ARBO OS — PRE-PUBLIC COMMERCE CHECKPOINT
## 10. ENRUTAMIENTO MULTI-TENANT PÚBLICO (MULTI-TENANT ROUTING)

---

## 1. IDENTIFICACIÓN DE TENANT & SUCURSAL EN LA WEB PÚBLICA

Para que un cliente consumidor pueda ver la carta y pedir a la sucursal correcta, la URL pública debe resolver de forma unívoca y segura el par:
$$\{\text{organization\_id}, \text{branch\_id}\}$$

### Modelos de Enrutamiento Evaluados:

1. **Subdominio por Organización**:
   - `trevelin.arbo.app` $\rightarrow$ Organización ARBO Trevelin.
   - Si tiene múltiples sucursales: selector de sucursal en el menú de inicio (`Trevelin Centro`, `Esquel Express`).
2. **Ruta por Path Slug (Recomendada para MVP)**:
   - `arbo.app/trevelin` o `arbo.app/arbo-patagonia`
   - O bien: `arbo.app/menu/:org_slug/:branch_slug`
   - Ejemplo: `arbo.app/menu/arbo/trevelin`

---

## 2. SEGURIDAD: PREVENCIÓN DE MANIPULACIÓN DE UUIDs

- **Regla Estricta**: La web pública **NUNCA** debe recibir ni enviar `organization_id` o `branch_id` como parámetros directos arbitrarios confiados al cliente (e.g. `POST /order { organization_id: "uuid..." }`).
- **Resolución Servidor**:
  - El cliente envía el slug de la sucursal (`trevelin`).
  - La base de datos o API resuelve el slug contra la tabla `branches` y obtiene el `organization_id` legítimo.
  - Esto evita que un atacante envíe productos de la Organización A con el `organization_id` de la Organización B (Tenant Hopping / IDOR).
