# ARBO OS — PRE-PHASE 9 CHECKPOINT
## 13. POLÍTICAS DE RLS Y SEGURIDAD

### 1. Requisitos de Aislamiento
- **Aislamiento Multi-Tenant**: Toda consulta analítica y sugerencia de compra debe filtrar irrevocablemente por `organization_id = auth_org()`.
- **Aislamiento por Sucursal**:
  - Un encargado de Trevelin solo ve compras sugeridas de los depósitos de Trevelin.
  - La dirección ejecutiva (Admin corporativo) puede ver la consolidación global de todas las sucursales.
- **Protección de Datos Financieros**:
  - Los reportes de rentabilidad y margen bruto solo son accesibles para roles autorizados (`ADMIN`, `MANAGER`).
