# ARBO OS — PRE-PHASE 7 CHECKPOINT
## 07. IMPACTO EN BASE DE DATOS & MODELO RELACIONAL PREVISTO
## (ANÁLISIS READ-ONLY — NO IMPLEMENTAR)

---

## 1. TABLAS NUEVAS PREVISTAS PARA FASE 7

### A. `fiscal_invoices` (Comprobantes Fiscales Emitidos)
- `id` UUID PRIMARY KEY
- `organization_id` UUID NOT NULL REFERENCES organizations(id)
- `branch_id` UUID NOT NULL REFERENCES branches(id)
- `sale_id` UUID NOT NULL REFERENCES sales(id)
- `invoice_type` VARCHAR(10) NOT NULL CHECK (invoice_type IN ('FACTURA_A', 'FACTURA_B', 'FACTURA_C', 'NOTA_CREDITO_A', 'NOTA_CREDITO_B', 'NOTA_CREDITO_C', 'COMPROBANTE_X'))
- `pos_number` INT NOT NULL (Punto de Venta AFIP, ej. 1, 2)
- `invoice_number` BIGINT NOT NULL (Correlativo oficial AFIP)
- `cae` VARCHAR(20) (Código de Autorización Electrónico)
- `cae_expires_at` DATE (Fecha de vencimiento del CAE)
- `afip_qr_url` TEXT (URL del código QR exigido por resolución general AFIP)
- `net_amount` NUMERIC(12, 2) NOT NULL (Subtotal neto gravado)
- `vat_amount` NUMERIC(12, 2) NOT NULL DEFAULT 0.00 (Total IVA liquidado)
- `total_amount` NUMERIC(12, 2) NOT NULL (Total final)
- `customer_tax_id` VARCHAR(50) (CUIT / DNI del comprador)
- `customer_name` VARCHAR(255) (Razón Social o Nombre)
- `customer_tax_condition` VARCHAR(50) (Responsable Inscripto, Consumidor Final, Monotributo)
- `status` VARCHAR(20) NOT NULL DEFAULT 'AUTHORIZED' CHECK (status IN ('AUTHORIZED', 'PENDING_CONTINGENCY', 'REJECTED', 'CANCELLED'))
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
- `CONSTRAINT uq_fiscal_invoice_correlative UNIQUE (organization_id, pos_number, invoice_type, invoice_number)`

### B. `fiscal_contingency_queue` (Cola de Resiliencia Fiscal)
- `id` UUID PRIMARY KEY
- `organization_id` UUID NOT NULL
- `branch_id` UUID NOT NULL
- `sale_id` UUID NOT NULL
- `fiscal_invoice_id` UUID NOT NULL
- `payload` JSONB NOT NULL
- `retry_count` INT NOT NULL DEFAULT 0
- `last_error` TEXT
- `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'RESOLVED', 'MANUAL_REVIEW'))
- `created_at`, `updated_at`

### C. `automation_rules` & `automation_executions`
- Tablas para configuración de reglas de negocio y registro de auditoría con `execution_key` único anti-spam.

---

## 2. MODIFICACIONES MENORES PREVISTAS EN TABLAS EXISTENTES

- `organizations`:
  - `tax_condition` VARCHAR(50) DEFAULT 'RESPONSABLE_INSCRIPTO'.
- `branches`:
  - `fiscal_pos_number` INT DEFAULT 1.
- `sales`:
  - `fiscal_invoice_id` UUID REFERENCES fiscal_invoices(id).
- `customers`:
  - `tax_condition` VARCHAR(50) DEFAULT 'CONSUMIDOR_FINAL'.
  - `document_type` VARCHAR(20) DEFAULT 'DNI'.
