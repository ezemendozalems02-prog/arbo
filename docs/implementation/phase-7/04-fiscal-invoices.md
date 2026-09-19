# ARBO OS — FASE 7: CAPA FISCAL ARGENTINA & AUTOMATIZACIONES
## 04. TABLA Y MODELO DE COMPROBANTES FISCALES (`fiscal_invoices`)

---

## 1. DEFINICIÓN RELACIONAL
La entidad `fiscal_invoices` preserva el registro legal inmutable de cada comprobante emitido en el sistema:

| Campo | Tipo | Restricciones | Propósito |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Identificador único del comprobante |
| `organization_id` | UUID | NOT NULL REFERENCES organizations | Tenant propietario del comprobante |
| `branch_id` | UUID | NOT NULL REFERENCES branches | Sucursal operativa de emisión |
| `sale_id` | UUID | NOT NULL REFERENCES sales | Venta originaria respaldada |
| `invoice_type` | VARCHAR(20) | CHECK (...) | Tipo oficial (FACTURA_A, B, C, X, etc.) |
| `pos_number` | INT | NOT NULL CHECK (> 0) | Punto de Venta AFIP |
| `invoice_number` | BIGINT | NOT NULL CHECK (> 0) | Correlativo oficial |
| `cae` | VARCHAR(30) | NULLABLE | Código de Autorización Electrónico |
| `cae_expires_at` | DATE | NULLABLE | Vencimiento otorgado por AFIP |
| `afip_qr_url` | TEXT | NULLABLE | URL oficial del QR de validación |
| `net_amount` | NUMERIC(12,2)| NOT NULL | Base neta imponible |
| `vat_amount` | NUMERIC(12,2)| NOT NULL | Débito fiscal liquidado |
| `total_amount` | NUMERIC(12,2)| NOT NULL | Importe bruto final |
| `status` | VARCHAR(30) | CHECK (...) | AUTHORIZED, PENDING_CONTINGENCY, REJECTED |

## 2. RESTRICCIONES DE INTEGRIDAD
1. `uq_fiscal_invoice_correlative`: `UNIQUE (organization_id, pos_number, invoice_type, invoice_number)`. Garantiza que no puedan coexistir dos facturas con la misma numeración en el mismo Punto de Venta.
2. `uq_fiscal_invoice_sale_type`: `UNIQUE (sale_id, invoice_type)`. Previene que reintentos de cobro dupliquen la emisión de la misma factura para una venta.

## 3. INMUTABILIDAD HISTÓRICA
Los importes, alícuotas y datos del comprador son almacenados como snapshots congelados. Cualquier cambio posterior en el catálogo o en los datos del cliente no afecta los registros fiscales ya emitidos.
