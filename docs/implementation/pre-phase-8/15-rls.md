# ARBO OS — PRE-PHASE 8 CHECKPOINT
## 15. POLÍTICAS DE SEGURIDAD A NIVEL DE FILA MULTI-SUCURSAL (RLS)

---

## 1. MATRIZ DE PERMISOS RLS PARA FASE 8

| Entidad | Rol: `OWNER` / `ADMIN` | Rol: `MANAGER` (Sucursal) | Rol: `CASHIER` / `STAFF` |
| :--- | :---: | :---: | :---: |
| `warehouses` | Acceso total a todos los depósitos | Lectura de todos; modificación en depósitos de su sucursal | Solo lectura de su depósito de trabajo |
| `stock_transfers` | Crear, despachar, recibir y cancelar en cualquier local | Crear y recibir transferencias con origen o destino en su sucursal | Solo consulta de remitos vinculados |
| `inventory_movements`| Auditoría global multi-sucursal | Lectura de movimientos de su sucursal | Inserción automática por venta de salón |

---

## 2. REGLA ESTRICTA DE AISLAMIENTO
- Ninguna política RLS permitirá que un empleado de la Sucursal A pueda firmar la recepción de un remito cuyo `destination_branch_id` sea la Sucursal B, a menos que su membresía cuente con `branch_id IS NULL` (permiso corporativo transversal).
- El rol anónimo (`anon`) tiene acceso 100% denegado a depósitos, transferencias y movimientos de stock.
