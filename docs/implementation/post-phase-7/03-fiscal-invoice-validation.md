# ARBO OS — POST-PHASE 7 CHECKPOINT
## 03. AUDITORÍA DE COMPROBANTES FISCALES (`fiscal_invoices`) Y CORRELATIVIDAD

---

## 1. INTEGRIDAD DEL MODELO RELACIONAL
Se verificaron los esquemas definidos en la migración `20260919000007_fiscal_layer_automation.sql`:
- Llaves foráneas obligatorias hacia `organizations(id)`, `branches(id)` y `sales(id)`.
- Restricción de unicidad estricta para la secuencia fiscal:
  ```sql
  CONSTRAINT uq_fiscal_invoice_correlative UNIQUE (organization_id, pos_number, invoice_type, invoice_number)
  ```
- Restricción anti-duplicación por venta:
  ```sql
  CONSTRAINT uq_fiscal_invoice_sale_type UNIQUE (sale_id, invoice_type)
  ```

## 2. CONTROL DE CORRELATIVIDAD & CONCURRENCIA
- La función `getNextInvoiceNumber` calcula el siguiente número oficial por Punto de Venta y Tipo de Comprobante.
- Se verificó que los Puntos de Venta operan de manera aislada (el Punto de Venta #1 y el Punto de Venta #2 inician su correlativo en #1 de forma independiente).
- Ante reintentos con la misma venta, el sistema devuelve el comprobante existente sin generar saltos de numeración ni números duplicados.
